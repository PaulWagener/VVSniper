(function () {
    var max_bid = 0;
    var active = false;
    var reloading = false;
    var intervalTimer = null;

    function check() {
        var lost_auction_button = document.querySelector('.lostAuction + .pay-your-auction');

        if (lost_auction_button !== null) {
            if (!reloading) {
                lost_auction_button.click();
                reloading = true;
            }

        } else {
            // Auction in progress (probably), gather information and return to central
            var time = document.querySelector('.time-container').innerText;
            var highest_bid = parseInt(document.querySelector('.highest-bid .highest-bid').innerText);
            var max_bid = parseInt(max_bid_div.value);
            var bid_input = document.querySelector('.bid-input');

            // Fill in a winning bid
            var winning_bid = highest_bid + 1;
            if (isNaN(max_bid)) {
                setState("Geen max bod ingevuld")
            } else if (winning_bid > max_bid) {
                setState("Hoogste bod (€" + highest_bid + ") is hoger dan max bod :(");
            } else {
                setState("Gereed om €" + winning_bid + " te bieden op 00:00:01");
                bid_input.value = winning_bid;
            }



        }

    }

    // Add the UI
    var sniper_div = document.createElement('div');
    sniper_div.innerHTML = `
    <div class="sniper">
        <span class="status active">Sniping...</span>
        <span class="status inactive">Not sniping</span>
        <img src="" class="icon">

        <form>
            Max bod: €<input class="max_bid" pattern="[0-9]+" required>
            <button type="submit" class="toggle">Snipe!</button>
            <div class="state"></div>
        </form>
    </div>
    `;
    sniper_div = sniper_div.querySelector('.sniper');
    var state_div = sniper_div.querySelector('.state');
    var image = sniper_div.querySelector('.icon');
    var toggleButton = sniper_div.querySelector('.toggle');
    var max_bid_div = sniper_div.querySelector('.max_bid');

    max_bid_div.addEventListener('input', function () {
        if (active) {
            check();
        }
    })

    var biddingBlock = document.querySelector('#biddingBlock');

    if (biddingBlock) {


        function setState(state) {
            state_div.innerText = state;
        }

        function toggleSniping() {
            active = !active;
            if (active) {
                sniper_div.classList.add('active');
                toggleButton.innerText = 'Stop';
                intervalTimer = window.setInterval(check, 500);
                check();
            } else {
                sniper_div.classList.remove('active');
                toggleButton.innerText = 'Snipe!';
                window.clearInterval(intervalTimer);
                setState("");
            }
        }

        biddingBlock.appendChild(sniper_div);


        image.src = chrome.extension.getURL('icon.png');

        sniper_div.querySelector('form').addEventListener('submit', function (e) {
            e.preventDefault();
            toggleSniping()
        });
    }


})();
