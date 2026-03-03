// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AgriDirect {

    struct History {
        string action;        // Verified / Sold
        string actorName;     // Farmer / Distributor / Retailer
        uint256 price;        // 0 for verification
        uint256 timestamp;
    }

    mapping(string => History[]) public productHistory;

    event ActionRecorded(
        string productId,
        string action,
        string actorName,
        uint256 price,
        uint256 timestamp
    );

    function verifyProduct(
        string memory _productId,
        string memory _farmerName,
        string memory _variety
    ) public {

        productHistory[_productId].push(
            History(
                "Verified",
                _farmerName,
                0,
                block.timestamp
            )
        );

        emit ActionRecorded(
            _productId,
            "Verified",
            _farmerName,
            0,
            block.timestamp
        );
    }

    function recordSale(
        string memory _productId,
        string memory _buyerName,
        uint256 _price
    ) public {

        productHistory[_productId].push(
            History(
                "Sold",
                _buyerName,
                _price,
                block.timestamp
            )
        );

        emit ActionRecorded(
            _productId,
            "Sold",
            _buyerName,
            _price,
            block.timestamp
        );
    }
}