import React, { useContext, createContext, useState, useEffect } from "react";
import {
  useAddress,
  useContract,
  useMetamask,
  useDisconnect,
  useConnectionStatus,
} from "@thirdweb-dev/react";
import { ethers } from "ethers";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const StateContext = createContext();

// Hardcoded INR to ETH conversion rate
// 1 INR ≈ 0.0000034 ETH (approx ₹1,90,000 = 1 ETH)
const INR_TO_ETH_RATE = 0.0000052632;

export const StateContextProvider = ({ children }) => {

  const { contract } = useContract(
    process.env.REACT_APP_CONTRACT_ADDRESS
  );

  const address = useAddress();
  const connectMetamask = useMetamask();
  const disconnect = useDisconnect();
  const connectionStatus = useConnectionStatus();

  const [contracts, setContracts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Helper: Convert INR amount to ETH (wei)
  const inrToWei = (inrAmount) => {
    const ethAmount = inrAmount * INR_TO_ETH_RATE;
    // Round to 18 decimal places max for ethers parsing
    return ethers.utils.parseEther(ethAmount.toFixed(18));
  };

  // ------------------------------------------------
  // Create Contract (Contractor)
  // Input: form.quantity, form.pricePerTon in INR
  // The INR total is converted to ETH and locked on-chain
  // ------------------------------------------------

  const createKrishiContract = async (form) => {
    try {
      // Convert pricePerTon from INR to wei
      // The smart contract does: totalAmount = quantity * pricePerTon
      // and checks: msg.value == totalAmount
      // So we must pass pricePerTon in wei, not INR, for the math to match
      const pricePerTonWei = inrToWei(form.pricePerTon);
      const totalAmountWei = pricePerTonWei.mul(form.quantity);

      console.log(`💰 Price/ton: ₹${form.pricePerTon} → ${ethers.utils.formatEther(pricePerTonWei)} ETH`);
      console.log(`💰 Total (${form.quantity} × price): ${ethers.utils.formatEther(totalAmountWei)} ETH`);

      const data = await contract.call(
        "createContract",
        [
          form.farmer,
          form.cropName,
          form.quantity,
          pricePerTonWei  // pass wei, not INR
        ],
        {
          value: totalAmountWei  // quantity * pricePerTonWei — matches contract's calculation
        }
      );

      toast.success("Contract created & funds locked on blockchain 🌾");

      console.log("Create Contract:", data);

      return data;

    } catch (error) {

      toast.error("Error creating contract on blockchain");
      console.log("Create Contract Error:", error);
      throw error;
    }
  };

  // ------------------------------------------------
  // Update Contract (Contractor)
  // ------------------------------------------------
  const updateContract = async (id, newPricePerTonInr, quantity) => {
    try {
      const newPricePerTonWei = inrToWei(newPricePerTonInr);

      // Compute old and new totals in wei using BigNumber math,
      // exactly mirroring the Solidity: newTotal = quantity * newPricePerTon
      // This avoids floating-point drift from converting INR differences separately.
      const onChainData = await contract.call("getContract", [id]);
      const oldTotalWei = onChainData.totalAmount; // BigNumber from chain
      const newTotalWei = newPricePerTonWei.mul(quantity);

      let additionalPaymentWei = ethers.utils.parseEther("0");
      if (newTotalWei.gt(oldTotalWei)) {
        additionalPaymentWei = newTotalWei.sub(oldTotalWei);
      }

      console.log(`Updating Contract ${id}`);
      console.log(`  Old total: ${ethers.utils.formatEther(oldTotalWei)} ETH`);
      console.log(`  New total: ${ethers.utils.formatEther(newTotalWei)} ETH`);
      console.log(`  Additional payment: ${ethers.utils.formatEther(additionalPaymentWei)} ETH`);
      
      const data = await contract.call("updateContract", [id, newPricePerTonWei], {
        value: additionalPaymentWei
      });

      toast.success("Contract updated on blockchain 📝");
      return data;
    } catch (error) {
      toast.error("Error updating contract on blockchain");
      console.log("Update Contract Error:", error);
      throw error;
    }
  };

  // ------------------------------------------------
  // Accept Contract (Farmer)
  // ------------------------------------------------

  const acceptContract = async (id) => {

    try {

      const data = await contract.call("acceptContract", [id]);

      toast.success("Contract Accepted on blockchain ✅");

      return data;

    } catch (error) {

      toast.error("Error accepting contract on blockchain");
      console.log(error);
      throw error;
    }
  };

  // ------------------------------------------------
  // Reject Contract (Farmer) → Refund to contractor
  // ------------------------------------------------

  const rejectContract = async (id) => {

    try {

      const data = await contract.call("rejectContract", [id]);

      toast.success("Contract Rejected. Funds returned to contractor 💸");

      return data;

    } catch (error) {

      toast.error("Error rejecting contract on blockchain");
      console.log(error);
      throw error;
    }
  };

  // ------------------------------------------------
  // Farmer Marks Out For Delivery
  // ------------------------------------------------

  const markOutForDelivery = async (id) => {

    try {

      const data = await contract.call("markOutForDelivery", [id]);

      toast.success("Marked Out For Delivery 🚚");

      return data;

    } catch (error) {

      toast.error("Error marking delivery on blockchain");
      console.log(error);
      throw error;
    }
  };

  // ------------------------------------------------
  // Contractor Confirms Delivery → Release payment to farmer
  // ------------------------------------------------

  const confirmDelivery = async (id) => {

    try {

      const data = await contract.call("confirmDelivery", [id]);

      toast.success("Payment Released to Farmer 💰");

      return data;

    } catch (error) {

      toast.error("Error confirming delivery on blockchain");
      console.log(error);
      throw error;
    }
  };

  // ------------------------------------------------
  // Get Contract Details
  // ------------------------------------------------

  const getContract = async (id) => {

    try {

      const data = await contract.call("getContract", [id]);

      return {
        id: data.id.toNumber(),
        contractor: data.contractor,
        farmer: data.farmer,
        cropName: data.cropName,
        quantity: data.quantity.toNumber(),
        pricePerTon: data.pricePerTon.toNumber(),
        totalAmount: data.totalAmount.toNumber(),
        status: data.status
      };

    } catch (error) {

      console.log("Get Contract Error:", error);

    }
  };

  // ------------------------------------------------
  // Get Contract Balance
  // ------------------------------------------------

  const getContractBalance = async () => {

    try {

      const balance = await contract.call("getContractBalance");

      return ethers.utils.formatEther(balance);

    } catch (error) {

      console.log(error);

    }
  };

  return (
    <StateContext.Provider
      value={{
        address,
        contract,
        connectMetamask,
        disconnect,
        connectionStatus,

        INR_TO_ETH_RATE,
        inrToWei,

        createKrishiContract,
        updateContract,
        acceptContract,
        rejectContract,
        markOutForDelivery,
        confirmDelivery,

        getContract,
        getContractBalance,

        isLoading,
        contracts,
        setContracts
      }}
    >
      <ToastContainer />
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);