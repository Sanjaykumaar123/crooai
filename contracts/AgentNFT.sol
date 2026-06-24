// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AgentNFT is ERC721URIStorage, Ownable {
    // Only registry contract is allowed to mint
    address public registry;

    event AgentRegistryLinked(address indexed registry);

    modifier onlyRegistryOrOwner() {
        require(msg.sender == registry || msg.sender == owner(), "Caller is not the registry or owner");
        _;
    }

    constructor() ERC721("AgentChain AI NFT", "AGENT") Ownable(msg.sender) {}

    function setRegistry(address _registry) external onlyOwner {
        require(_registry != address(0), "Invalid registry address");
        registry = _registry;
        emit AgentRegistryLinked(_registry);
    }

    function mint(address to, uint256 tokenId, string memory tokenURI) external onlyRegistryOrOwner {
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
    }
}
