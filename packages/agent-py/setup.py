from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="openkitx403-agent",
    version="1.0.0",
    author="OpenKitx403",
    author_email="support@openkitx403.dev",
    description="AI Agent toolkit for OpenKitx403 Solana wallet authentication",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/openkitx403/openkitx403",
    project_urls={
        "Bug Tracker": "https://github.com/openkitx403/openkitx403/issues",
        "Documentation": "https://openkitx403.dev",
    },
    packages=find_packages(exclude=["tests", "examples"]),
    classifiers=[
        "Development Status :: 5 - Production/Stable",
        "Intended Audience :: Developers",
        "Topic :: Software Development :: Libraries :: Python Modules",
        "Topic :: Security :: Cryptography",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
    ],
    python_requires=">=3.8",
    install_requires=[
        "openkitx403-client>=1.0.0",
        "pydantic>=2.0.0",
        "httpx>=0.24.0",
    ],
    extras_require={
        "langchain": [
            "langchain>=0.1.0",
            "langchain-core>=0.1.0",
        ],
        "dev": [
            "pytest>=7.0.0",
            "pytest-asyncio>=0.21.0",
            "black>=23.0.0",
            "mypy>=1.0.0",
            "ruff>=0.1.0",
        ],
    },
    keywords="solana blockchain wallet authentication ai agent langchain web3",
)
