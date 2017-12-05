(function () {
    // Logic
    function Sniper() {
        var auction_page = new AuctionPage(this);
        var sniper_box = new SniperBox(this);

        var max_bid = null;
        var interval_timer = null;
        var active = false;
        var bid_placed = false;

        // Check if we are still active from the previous page
        getBidForPage((saved_max_bid) => {
            if (saved_max_bid) {
                max_bid = saved_max_bid;
                sniper_box.setMaxBid(max_bid);
                this.toggleClicked();
            }
        })

        this.maxBidChanged = function (new_max_bid) {
            max_bid = new_max_bid;
            if (active) {
                saveBidForPage(max_bid);
                check();
            }
        }

        this.toggleClicked = function () {
            active = !active;
            if (active) {
                sniper_box.setActive();
                sniper_box.setToggleButtonText('Stop');
                startChecking();
                saveBidForPage(max_bid);
            } else {
                sniper_box.setInactive();
                sniper_box.setToggleButtonText('Snipe!');
                stopChecking();
                clearBidForPage();
                sniper_box.setState("");
            }
        }

        function startChecking() {
            interval_timer = window.setInterval(check, 500);
            check();
        }

        function stopChecking() {
            window.clearInterval(interval_timer);
        }

        // Function that is continuously executed when sniping is active
        function check() {
            if (auction_page.tryNavigatingToNextAuction()) {
                // Navigating away, no more checking
                sniper_box.setState("Naar de volgende veiling toegaan...");
                stopChecking();
                return;
            }

            var highest_bid = auction_page.getHighestBid();
            var winning_bid = highest_bid + 1;

            if (bid_placed) {
                sniper_box.setState("Bod gedaan");
            } else if (max_bid === null) {
                sniper_box.setState("Geen max bod ingevuld")
            } else if (winning_bid > max_bid) {
                sniper_box.setState("Winnende bod (€" + winning_bid + ") is hoger dan max bod (€" + max_bid + ")");
            } else {
                sniper_box.setState("Gereed om €" + winning_bid + " te bieden op 00:00:00");
                if (auction_page.getTimeRemaining() === '00:00:00') {
                    auction_page.fillInBid(winning_bid);
                    auction_page.placeBid();
                    bid_placed = true;
                    stopChecking();
                }
            }
        }

        // Storage functions
        function saveBidForPage(bid) {
            var store = {};
            store[window.location.pathname] = bid;
            chrome.storage.local.set(store);
        }

        function clearBidForPage() {
            chrome.storage.local.clear();
        }

        function getBidForPage(callback) {
            chrome.storage.local.get(window.location.pathname, function (store) {
                if (store[window.location.pathname]) {
                    callback(store[window.location.pathname]);
                } else {
                    callback(null);
                }
            });
        }
    }

    // Interfacing with the vakantieveilingen auction page
    function AuctionPage(sniper) {
        var bid_input = document.querySelector('.bid-input');
        var time_container_div = document.querySelector('.time-container');
        var bid_button = document.querySelector('#jsActiveBidButton');

        // Returns a string with the remaining time
        this.getTimeRemaining = function () {
            return time_container_div.innerText;
        }

        this.getHighestBid = function () {
            return parseInt(document.querySelector('.highest-bid .highest-bid').innerText);
        }

        this.fillInBid = function (bid) {
            bid_input.value = bid;
        }

        this.placeBid = function () {
            bid_button.click();
        }

        this.tryNavigatingToNextAuction = function () {
            var next_auction_button = document.querySelector('.lostAuction + .pay-your-auction') || document.querySelector('.second-laugh:not(.hidden) .back-to-bidding-btn');
            if (next_auction_button) {
                // Timeout to prevent a 'next auction is closed'
                window.setTimeout(() => {
                    next_auction_button.click();
                }, 3000);
                return true;
            } else {
                return false;
            }
        }
    }

    // Interfacing with the sniperbox on the page
    function SniperBox(sniper) {
        // Create the DOM
        var temp_body = document.createElement('body');
        temp_body.innerHTML = `
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

        // Get references to the DOM
        var sniper_div = temp_body.querySelector('.sniper');
        var state_div = sniper_div.querySelector('.state');
        var image = sniper_div.querySelector('.icon');
        var toggle_button = sniper_div.querySelector('.toggle');
        var max_bid_input = sniper_div.querySelector('.max_bid');

        max_bid_input.addEventListener('input', function () {
            if (this.value === '') {
                sniper.maxBidChanged(null);
            } else {
                sniper.maxBidChanged(parseInt(this.value));
            }
        });

        image.src = chrome.extension.getURL('icon.png');

        sniper_div.querySelector('form').addEventListener('submit', function (e) {
            e.preventDefault();
            sniper.toggleClicked();
        });


        // Add to DOM
        var biddingBlock = document.querySelector('#biddingBlock');

        if (biddingBlock) {
            biddingBlock.appendChild(sniper_div);
        }

        // Public functions
        this.setMaxBid = function (max_bid) {
            max_bid_input.value = max_bid;
        }

        this.setActive = function () {
            sniper_div.classList.add('active');
        }

        this.setInactive = function () {
            sniper_div.classList.remove('active');
        }

        this.setState = function (text) {
            state_div.innerText = text;
        }

        this.setToggleButtonText = function (text) {
            toggle_button.innerText = text;
        }
    }

    new Sniper();
})();
