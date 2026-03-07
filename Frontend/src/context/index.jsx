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

  // ------------------------------------------------
  // Create Contract (Contractor)
  // ------------------------------------------------

  const createKrishiContract = async (form) => {
    try {

      const totalAmount = form.quantity * form.pricePerTon;

      const data = await contract.call(
        "createContract",
        [
          form.farmer,
          form.cropName,
          form.quantity,
          form.pricePerTon
        ],
        {
          value: totalAmount
        }
      );

      toast.success("Contract created successfully 🌾");

      console.log("Create Contract:", data);

      return data;

    } catch (error) {

      toast.error("Error creating contract");

      console.log("Create Contract Error:", error);

    }
  };

  // ------------------------------------------------
  // Accept Contract (Farmer)
  // ------------------------------------------------

  const acceptContract = async (id) => {

    try {

      const data = await contract.call("acceptContract", [id]);

      toast.success("Contract Accepted");

      return data;

    } catch (error) {

      toast.error("Error accepting contract");

      console.log(error);

    }
  };

  // ------------------------------------------------
  // Reject Contract (Farmer)
  // ------------------------------------------------

  const rejectContract = async (id) => {

    try {

      const data = await contract.call("rejectContract", [id]);

      toast.success("Contract Rejected");

      return data;

    } catch (error) {

      toast.error("Error rejecting contract");

      console.log(error);

    }
  };

  // ------------------------------------------------
  // Farmer Marks Delivery
  // ------------------------------------------------

  const markOutForDelivery = async (id) => {

    try {

      const data = await contract.call("markOutForDelivery", [id]);

      toast.success("Marked Out For Delivery 🚚");

      return data;

    } catch (error) {

      toast.error("Error marking delivery");

      console.log(error);

    }
  };

  // ------------------------------------------------
  // Contractor Confirms Delivery
  // ------------------------------------------------

  const confirmDelivery = async (id) => {

    try {

      const data = await contract.call("confirmDelivery", [id]);

      toast.success("Payment Released to Farmer 💰");

      return data;

    } catch (error) {

      toast.error("Error confirming delivery");

      console.log(error);

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

        createKrishiContract,
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