// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity >=0.8.4;

/// @notice SportsClub DAO whitelist manager interface.
interface ISportsClubWhitelistManager {
    function whitelistedAccounts(uint256 listId, address account) external returns (bool);
}
