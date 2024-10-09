async function callBackend(reqBody, endpoint) {
  let myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  var raw = JSON.stringify(reqBody);

  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  return await fetch(
    `https://hackathonmaverick.in/tronplay/server.php?action=${endpoint}`,
    requestOptions
  )
    .then((response) => response.json())
    .then((result) => result)
    .catch((error) => {
      console.log(error);
      return `ERROR: ${error}`;
    });
}

async function updateBalance(amount) {
  document.querySelector("#balance").innerHTML = `${
    balanceDiv.textContent.split(" ")[0] - amount
  } TRX`;
}

async function purchaseCall(amount, memo, song = "", cardId = "") {
  document.querySelector(".modal h2").textContent = "Payment Workflow";
  positionModal();

  toggleClasses.forEach((el) => el.classList.toggle("hidden"));
  document.querySelector(".modal div").style.display = "none";
  paymentDetails.style.display = "block";
  closeModalBtn.style.display = "none";
  confirmation.style.display = "block";

  paymentMemo.textContent = memo;
  paymentAmount.textContent = `${amount} TRX`;
  confirmation.style.display = "none";
  paymentFlow.style.display = "flex";
  timer.style.display = "block";

  const start = Date.now();
  const showElapsedTime = () => {
    timer.textContent = `${Math.floor(
      (Date.now() - start) / 1000
    )} seconds elapsed`;
  };
  const timerInterval = setInterval(showElapsedTime, 1000);

  step1.style.filter = "grayscale(0%)";
  step2.style.filter = "grayscale(0%)";
  document.querySelector(".modal h2").textContent = "Signing the transaction";

  try {
    const txnResult = await sendTron(memo, amount);
    if (txnResult.success === false) {
      clearInterval(timerInterval);
      resetStyling();
      toggleClasses.forEach((el) => el.classList.toggle("hidden"));
      return;
    }
    console.log(txnResult ? "Txn was successful" : "Txn failed");

    updateBalance(amount);

    step4.style.filter = "grayscale(0%)";
    document.querySelector(".modal h2").textContent = "Updating the record";

    // update the transactions in the frontend and backend
    let txnCount = 0;
    for (let keys in transactions) {
      txnCount++;
    }

    // changing in the frontend
    transactions[txnCount] = {
      trx: amount,
      explorer: chainExplorer,
      txnHash: txnResult.txn.txid,
      memo: paymentMemo.textContent,
    };

    // changing in the backend
    callBackend(
      {
        trx: amount,
        wallet: changeAddress,
        explorer: chainExplorer,
        txnHash: txnResult.txn.txid,
        memo: paymentMemo.textContent,
      },
      "updateHashes"
    );
  } catch (err) {
    clearInterval(timerInterval);
    resetStyling();
    toggleClasses.forEach((el) => el.classList.toggle("hidden"));
    return;
  }

  // song is null when we are just purchasing the hints
  if (song === "") {
    // highlight the correct card
    document.querySelector(`#${cardId}`).style.border = "5px solid pink";
  } else {
    purchasedSongs += song;
    attachEventListeners();

    // changing in the backend
    callBackend(
      {
        wallet: changeAddress,
        song: song,
      },
      "updateSongs"
    );
  }

  clearInterval(timerInterval);
  document.querySelector(".modal h2").textContent = "Transaction completed 😊";
  closeModalBtn.style.display = "block";
}

// TRON LINK connection function
async function connectTronLink() {
  if (window.tronLink) {
    document.querySelector("#loader").style.display = "block";

    try {
      // Request TronLink account access
      const connected = await window.tronLink.request({
        method: "tron_requestAccounts",
      });

      if (connected.code === 200) {
      } else {
        console.log("Failed to connect to TronLink");
      }
    } catch (error) {
      console.error("Error connecting to TronLink:", error);
    }

    document.querySelector("#loader").style.display = "none";
  } else {
    document.querySelector("#gameBtn").style.visibility = "hidden";
    walletError.style.visibility = "visible";
    walletError.innerHTML = `Install <a style="text-decoration: underline; color: white" href="https://chromewebstore.google.com/detail/tronlink/ibnejdfjmmkpcnlpebklmnkoeoihofec" target="_blank">TronLink extension</a> to play the game`;
  }
}

// send TRX function
async function sendTron(
  memo,
  amount,
  adminWallet = "TGApWzhkwoUzvuCFqqtSwWrpv2RQg4hftK"
) {
  try {
    // Convert TRX to Sun (1 TRX = 1e6 Sun)
    const amountInSun = amount * 1e6;

    // Step 1: Create the transaction
    const transaction = await window.tronWeb.transactionBuilder.sendTrx(
      adminWallet,
      amountInSun,
      window.tronWeb.defaultAddress.base58 // sender address
    );

    // Step 2: Attach memo to the transaction
    const nexTxn = await window.tronWeb.transactionBuilder.addUpdateData(
      transaction,
      tronWeb.toHex(memo) // Memo in hex format
    );

    // Step 3: Sign the transaction with the user's private key
    const signedTransaction = await window.tronWeb.trx.sign(nexTxn);

    // Step 4: Broadcast the signed transaction
    const broadcastResult = await window.tronWeb.trx.sendRawTransaction(
      signedTransaction
    );

    return {
      txn: broadcastResult,
      success: true,
    };
  } catch (error) {
    // error = Confirmation declined by user (if user rejects the transaction)
    // error.message may contain something else its undefined
    console.error(error);

    return {
      tx: null,
      success: false,
    };
  }
}

// function to pay user
async function payUser(amount, message, toAddress = changeAddress) {
  document.querySelector("body").style.pointerEvents = "none";
  document.querySelector("#loader").style.display = "block";

  try {
    const response = await fetch("https://tron-s7-server.glitch.me/send-trx", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        toAddress,
        message,
        amount,
      }),
    });

    const res = await response.json();

    if (res.success) {
      coin.play();

      const notification = document.getElementById("notification");
      const txnAmount =
        res.result.transaction.raw_data.contract[0].parameter.value.amount;
      notification.innerHTML = `${(txnAmount / 1e6).toFixed(
        2
      )} TRX(s) have been deposited in your wallet!<br><br>Refresh to see the txn`;

      notification.classList.add("show");

      // Hide it after 4 seconds
      setTimeout(() => {
        notification.classList.remove("show");
        notification.classList.add("hide");
      }, 4000);
    }
  } catch (error) {
    console.log("Can't pay user:", error);
  }

  document.querySelector("body").style.pointerEvents = "auto";
  document.querySelector("#loader").style.display = "none";
}

// Trying to look for already added wallets in the TRON link extension
(async () => {
  let tronLinkHandled = false; // Flag to ensure handleTronLink is called only once

  if (window.tronLink) {
    handleTronLink();
  } else {
    window.addEventListener("tronLink#initialized", handleTronLink, {
      once: true,
    });

    // If the event is not dispatched by the end of the timeout,
    // the user probably doesn't have TronLink installed.
    setTimeout(handleTronLink, 3000); // 3 seconds
  }

  async function handleTronLink() {
    if (tronLinkHandled) return; // Ensure it runs only once
    tronLinkHandled = true;

    const { tronLink } = window;
    if (tronLink) {
      document.querySelector("#gameBtn").style.visibility = "visible";
      document.querySelector("#walletError").style.visibility = "hidden";

      if (!tronWeb.defaultAddress.base58 || anotherChain) {
        document.querySelector("#walletError").style.visibility = "visible";
        document.querySelector("#walletError").textContent =
          "Either the Tron Link extension is not connected/locked/connected to a mainnet chain, or has 0 wallets";
        return;
      }

      document.querySelector("#gameBtn").textContent = "Play Game";
      document.querySelector(
        "#tronWalletDetails"
      ).textContent = `${tronWeb.defaultAddress.name} (${tronWeb.defaultAddress.base58})`;

      // Get and display the balance
      const balance = await window.tronWeb.trx.getBalance(
        window.tronWeb.defaultAddress.base58
      );
      // console.log("Balance:", balance / 1e6, "TRX");
    } else {
      walletError.style.visibility = "visible";
      walletError.innerHTML = `Install <a style="text-decoration: underline; color: white" href="https://chromewebstore.google.com/detail/tronlink/ibnejdfjmmkpcnlpebklmnkoeoihofec" target="_blank">TronLink extension</a> to play the game`;
    }
  }
})();

// Looking for tron link events:
window.addEventListener("message", async function (e) {
  if (e.data.message && e.data.message.action == "tabReply") {
    if (
      e.data.message.data.data.address &&
      e.data.message.data.data.chainId &&
      e.data.message.data.data.node &&
      signupResult == undefined
    ) {
      if (signupResult == undefined) {
        signupResult = {};

        if (
          e.data.message.data.data.chainId !== "0x94a9059e" &&
          e.data.message.data.data.chainId !== "0xcd8690dc"
        ) {
          anotherChain = true;
          walletError.style.visibility = "visible";
          // document.querySelector("#gameBtn").style.visibility = "hidden";
          walletError.innerHTML = `Only Shasta/Nile testnet chains are allowed`;
          return;
        }

        if (e.data.message.data.data.node.defaultToken != "TRX") {
          document.querySelector("#gameBtn").style.visibility = "hidden";
          walletError.style.visibility = "visible";
          walletError.innerHTML = `Switch to TRX token to play the game`;
          return;
        }

        chainExplorer = e.data.message.data.data.node.hostname;
        document.querySelector("#walletError").style.visibility = "hidden";

        document.querySelector("#gameBtn").style.visibility = "visible";
        document.querySelector(
          "#username"
        ).innerHTML = `👋 <span style="color: black">${e.data.message.data.data.address} - ${e.data.message.data.data.name}</span>`;
        changeAddress = e.data.message.data.data.address;

        document.querySelector("#gameBtn").textContent = "Play Game";

        // Get and display the balance
        const balance = await window.tronWeb.trx.getBalance(
          window.tronWeb.defaultAddress.base58
        );
        document.querySelector(
          "#tronWalletDetails"
        ).textContent = `${tronWeb.defaultAddress.name} (${tronWeb.defaultAddress.base58})`;

        signupResult = await callBackend(
          { wallet: changeAddress },
          "userDetails"
        );

        score = signupResult.score;
        streak = signupResult.streak;
        purchasedSongs = signupResult.songs;
        transactions = signupResult.txnHashes;

        const visited = signupResult.visited;

        if (streak == 1 && !visited) await payUser(0.05, "Day 1 streak reward");
        else if (streak == 2 && !visited)
          await payUser(0.1, "Day 2 streak reward");
        else if (streak >= 3 && !visited)
          await payUser(0.2, "Day 3+ streak reward");

        document.querySelector("#overAllScore").innerHTML = signupResult.score;
        balanceDiv.textContent = `${Number(balance / 1e6).toFixed(2)} TRX`;
      }
    }
  }

  // Tronlink chrome v3.22.1 & Tronlink APP v4.3.4 started to support
  if (e.data.message && e.data.message.action == "disconnect") {
    window.location.reload();
  }

  // Tronlink chrome v3.22.0 & Tronlink APP v4.3.4 started to support
  if (e.data.message && e.data.message.action == "accountsChanged") {
    window.location.reload();
  }

  if (e.data.message && e.data.message.action == "setNode") {
    window.location.reload();
  }
});
var obj = setInterval(async () => {
  //if (window.tronLink.tronWeb)
  if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
    clearInterval(obj);
  }
}, 50);
