// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {MicroEscrow} from "../src/MicroEscrow.sol";

/**
 * @title DeployScript
 * @author MicroEscrow Team
 * @notice Automated deployment script for Arbitrum Sepolia / Base Sepolia testnets.
 * @dev Reads PRIVATE_KEY from environment, broadcasts the deployment, and outputs
 *      the verified contract address for the Next.js frontend configuration.
 */
contract DeployScript is Script {
    function run() external {
        // Read deployer private key from environment (.env)
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        // Arbiter defaults to the deployer if not explicitly set
        address arbiter = vm.envOr("ARBITER_ADDRESS", deployer);

        console2.log("==================================================");
        console2.log("          MICROESCROW PROTOCOL DEPLOYMENT         ");
        console2.log("==================================================");
        console2.log("Deployer Address :", deployer);
        console2.log("Initial Arbiter  :", arbiter);
        console2.log("Chain ID         :", block.chainid);

        // Start broadcasting on-chain transactions
        vm.startBroadcast(deployerPrivateKey);

        MicroEscrow escrow = new MicroEscrow(arbiter);

        vm.stopBroadcast();

        console2.log("--------------------------------------------------");
        console2.log("MicroEscrow successfully deployed to:");
        console2.log(address(escrow));
        console2.log("--------------------------------------------------");
        console2.log("ACTION REQUIRED FOR FRONTEND INTEGRATION:");
        console2.log("Copy the contract address above into:");
        console2.log("web/src/config/contracts.ts -> NEXT_PUBLIC_ESCROW_ADDRESS");
        console2.log("==================================================");
    }
}