// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract KrishiVerseEscrow {
    // -------- Reentrancy Guard --------
    bool private locked;

    modifier nonReentrant() {
        require(!locked, "Reentrant call detected");
        locked = true;
        _;
        locked = false;
    }

    enum Status {
        Created,
        Accepted,
        Rejected,
        OutForDelivery,
        Delivered,
        Cancelled
    }

    struct CropContract {
        uint256 id;
        address contractor;
        address farmer;
        string cropName;
        uint256 quantity;
        uint256 pricePerTon;
        uint256 totalAmount;
        Status status;
    }

    uint256 public contractCounter;
    mapping(uint256 => CropContract) public contracts;

    // ---------------- EVENTS ----------------

    event ContractCreated(
        uint256 indexed id,
        address indexed contractor,
        address indexed farmer,
        uint256 totalAmount
    );

    event ContractUpdated(uint256 indexed id, uint256 newPricePerTon);
    event ContractAccepted(uint256 indexed id);
    event ContractRejected(uint256 indexed id);
    event OutForDelivery(uint256 indexed id);
    event Delivered(uint256 indexed id);
    event Refunded(uint256 indexed id);

    // ---------------- MODIFIERS ----------------

    modifier onlyContractor(uint256 _id) {
        require(msg.sender == contracts[_id].contractor, "Not contractor");
        _;
    }

    modifier onlyFarmer(uint256 _id) {
        require(msg.sender == contracts[_id].farmer, "Not farmer");
        _;
    }

    modifier validContract(uint256 _id) {
        require(_id < contractCounter, "Invalid contract ID");
        _;
    }

    modifier inStatus(uint256 _id, Status _status) {
        require(contracts[_id].status == _status, "Invalid status");
        _;
    }

    // ====================================================
    // 1️⃣ Contractor creates contract & locks full amount
    // ====================================================

    function createContract(
        address _farmer,
        string memory _cropName,
        uint256 _quantity,
        uint256 _pricePerTon
    ) external payable nonReentrant {
        require(_farmer != address(0), "Invalid farmer");
        require(_quantity > 0, "Quantity must be > 0");
        require(_pricePerTon > 0, "Price must be > 0");

        uint256 totalAmount = _quantity * _pricePerTon;

        require(msg.value == totalAmount, "Incorrect payment amount");

        contracts[contractCounter] = CropContract({
            id: contractCounter,
            contractor: msg.sender,
            farmer: _farmer,
            cropName: _cropName,
            quantity: _quantity,
            pricePerTon: _pricePerTon,
            totalAmount: totalAmount,
            status: Status.Created
        });

        emit ContractCreated(contractCounter, msg.sender, _farmer, totalAmount);

        contractCounter++;
    }

    // ====================================================
    // 2️⃣ Contractor updates price BEFORE acceptance
    // ====================================================

    function updateContract(
        uint256 _id,
        uint256 _newPricePerTon
    )
        external
        payable
        validContract(_id)
        onlyContractor(_id)
        inStatus(_id, Status.Created)
        nonReentrant
    {
        require(_newPricePerTon > 0, "Invalid price");

        CropContract storage crop = contracts[_id];

        uint256 oldTotal = crop.totalAmount;
        uint256 newTotal = crop.quantity * _newPricePerTon;

        if (newTotal > oldTotal) {
            require(
                msg.value == (newTotal - oldTotal),
                "Additional payment required"
            );
        } else if (newTotal < oldTotal) {
            uint256 refundAmount = oldTotal - newTotal;

            crop.totalAmount = newTotal;
            crop.pricePerTon = _newPricePerTon;

            (bool success, ) = payable(crop.contractor).call{
                value: refundAmount
            }("");
            require(success, "Refund failed");

            emit ContractUpdated(_id, _newPricePerTon);
            return;
        }

        crop.totalAmount = newTotal;
        crop.pricePerTon = _newPricePerTon;

        emit ContractUpdated(_id, _newPricePerTon);
    }

    // ====================================================
    // 3️⃣ Farmer accepts contract
    // ====================================================

    function acceptContract(
        uint256 _id
    )
        external
        validContract(_id)
        onlyFarmer(_id)
        inStatus(_id, Status.Created)
    {
        contracts[_id].status = Status.Accepted;

        emit ContractAccepted(_id);
    }

    // ====================================================
    // 4️⃣ Farmer rejects → refund contractor
    // ====================================================

    function rejectContract(
        uint256 _id
    )
        external
        validContract(_id)
        onlyFarmer(_id)
        inStatus(_id, Status.Created)
        nonReentrant
    {
        CropContract storage crop = contracts[_id];

        uint256 amount = crop.totalAmount;

        require(amount > 0, "No funds");

        crop.totalAmount = 0;
        crop.status = Status.Rejected;

        (bool success, ) = payable(crop.contractor).call{value: amount}("");

        require(success, "Refund failed");

        emit ContractRejected(_id);
        emit Refunded(_id);
    }

    // ====================================================
    // 5️⃣ Farmer marks Out For Delivery
    // ====================================================

    function markOutForDelivery(
        uint256 _id
    )
        external
        validContract(_id)
        onlyFarmer(_id)
        inStatus(_id, Status.Accepted)
    {
        contracts[_id].status = Status.OutForDelivery;

        emit OutForDelivery(_id);
    }

    // ====================================================
    // 6️⃣ Contractor confirms delivery → release payment
    // ====================================================

    function confirmDelivery(
        uint256 _id
    )
        external
        validContract(_id)
        onlyContractor(_id)
        inStatus(_id, Status.OutForDelivery)
        nonReentrant
    {
        CropContract storage crop = contracts[_id];

        uint256 amount = crop.totalAmount;

        require(amount > 0, "No funds to release");

        crop.totalAmount = 0;
        crop.status = Status.Delivered;

        (bool success, ) = payable(crop.farmer).call{value: amount}("");

        require(success, "Payment failed");

        emit Delivered(_id);
    }

    // ====================================================
    // View Functions
    // ====================================================

    function getContract(
        uint256 _id
    ) external view validContract(_id) returns (CropContract memory) {
        return contracts[_id];
    }

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
