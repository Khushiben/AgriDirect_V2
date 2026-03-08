// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AgriDirect {

    struct Product {
        string productId;
        string farmerName;
        string variety;
        uint256 timestamp;
    }

    struct Sale {
        string productId;
        string buyerName;
        uint256 price;
        uint256 timestamp;
    }

    Product[] public products;
    Sale[] public sales;

    event ProductVerified(
        string productId,
        string farmerName,
        string variety,
        uint256 timestamp
    );

    event ProductSold(
        string productId,
        string buyerName,
        uint256 price,
        uint256 timestamp
    );

    function verifyProduct(
        string memory _productId,
        string memory _farmerName,
        string memory _variety
    ) public {
        products.push(Product(
            _productId,
            _farmerName,
            _variety,
            block.timestamp
        ));

        emit ProductVerified(
            _productId,
            _farmerName,
            _variety,
            block.timestamp
        );
    }

    function recordSale(
        string memory _productId,
        string memory _buyerName,
        uint256 _price
    ) public {
        sales.push(Sale(
            _productId,
            _buyerName,
            _price,
            block.timestamp
        ));

        emit ProductSold(
            _productId,
            _buyerName,
            _price,
            block.timestamp
        );
    }
}