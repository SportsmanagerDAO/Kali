// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity >=0.8.4;

import '../../libraries/SafeTransferLib.sol';
import '../../interfaces/IERC20minimal.sol';
import '../../interfaces/ISportsClubWhitelistManager.sol';
import '../../utils/ReentrancyGuard.sol';

/// @notice Crowdsale contract that receives ETH or tokens to mint registered DAO tokens, including merkle whitelisting.
/// @dev This is meant to simulate a logarithmic curve with significantly less computation.
contract SportsClubDAOloglikeCurve is ReentrancyGuard {
    using SafeTransferLib for address;

    event ExtensionSet(
        uint256 indexed listId, 
        uint256 startingPrice, 
        uint96 purchaseLimit, 
        uint96 blockSize, 
        uint96 blockPriceIncrement, 
        uint8 velocity,
        uint32 saleEnds
    );

    event ExtensionCalled(address indexed dao, address indexed member, uint256 indexed amountOut);

    error SaleEnded();

    error NotWhitelisted();

    error NotPrice();

    error PurchaseLimit();

    error InvalidVelocity();
    
    ISportsClubWhitelistManager public immutable whitelistManager;

    mapping(address => Crowdsale) public crowdsales;

    struct Crowdsale {
        uint256 listId;
        uint256 startingPrice;
        uint96 purchaseLimit;
        uint96 amountPurchased;
        uint96 blockSize;
        uint96 blockPriceIncrement;
        uint8 velocity;
        uint32 saleEnds;
    }

    constructor(ISportsClubWhitelistManager whitelistManager_) {
        whitelistManager = whitelistManager_;
    }

    function setExtension(bytes calldata extensionData) public nonReentrant virtual {
        (
            uint256 listId, 
            uint256 startingPrice, 
            uint96 purchaseLimit, 
            uint96 blockSize, 
            uint96 blockPriceIncrement, 
            uint8 velocity,
            uint32 saleEnds
        ) 
            = abi.decode(extensionData, (uint256, uint256, uint96, uint96, uint96, uint8, uint32));

        if (velocity >= 100 || velocity == 0) revert InvalidVelocity();

        crowdsales[msg.sender] = Crowdsale({
            listId: listId,
            startingPrice: startingPrice,
            purchaseLimit: purchaseLimit,
            amountPurchased: 0,
            blockSize: blockSize,
            blockPriceIncrement: blockPriceIncrement,
            velocity: velocity,
            saleEnds: saleEnds
        });

        emit ExtensionSet(listId, startingPrice, purchaseLimit, blockSize, blockPriceIncrement, velocity, saleEnds);
    }

    function callExtension(
        address account, 
        uint256 amount, 
        bytes calldata
    ) public payable nonReentrant virtual returns (bool mint, uint256 amountOut) {
        Crowdsale storage sale = crowdsales[msg.sender];

        if (block.timestamp > sale.saleEnds) revert SaleEnded();

        if (sale.listId != 0) 
            if (!whitelistManager.whitelistedAccounts(sale.listId, account)) revert NotWhitelisted();
        
        uint256 estPrice = estimatePrice(sale, amount);

        if (msg.value != estPrice) revert NotPrice();

        amountOut = amount;

        if (sale.amountPurchased + amountOut > sale.purchaseLimit) revert PurchaseLimit();

        // send ETH to DAO
        msg.sender._safeTransferETH(msg.value);

        sale.amountPurchased += uint96(amountOut);

        mint = true;

        emit ExtensionCalled(msg.sender, account, amountOut);
    }

    function estimatePrice(Crowdsale memory sale, uint256 amount) public view returns (uint256) {
        uint256 totalSupply = IERC20minimal(msg.sender).totalSupply();

        uint256 used = totalSupply % sale.blockSize;

        uint256 remainingInBlock = sale.blockSize - used;

        uint256 currentPrice = sale.startingPrice;

        uint256 currentBlock = totalSupply / sale.blockSize;

        uint256 increment = sale.blockPriceIncrement;

        for (uint256 i = 0; i < currentBlock; i++) {
            increment = changeIncrement(sale, increment);

            currentPrice += increment;
        }

        uint256 estTotal;

        if (amount <= remainingInBlock) {
            estTotal = amount * currentPrice;
        } else {
            estTotal += remainingInBlock * currentPrice;

            currentBlock = totalSupply / sale.blockSize;

            increment = sale.blockPriceIncrement;
            for (uint256 i = 0; i < currentBlock; i++) {
                increment = changeIncrement(sale, increment);
            }

            currentPrice += increment;

            uint256 remainingAmount = amount - remainingInBlock;

            uint256 remainder = remainingAmount % sale.blockSize;

            uint256 blocksRemaining = remainingAmount / sale.blockSize;

            for (uint256 i = 0; i < blocksRemaining; i++) {
                estTotal += currentPrice * sale.blockSize;

                increment = changeIncrement(sale, increment);

                currentPrice += increment;
            }

            if (remainder != 0) {
                estTotal += remainder * currentPrice;
            }
        }

        return estTotal;
    }

    function changeIncrement(Crowdsale memory sale, uint256 increment) public pure returns (uint256) {
      return (increment * sale.velocity) / 100;
    }
}
