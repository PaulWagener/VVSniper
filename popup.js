// When the user clicks the extension icon
document.addEventListener('DOMContentLoaded', () => {
    var queryInfo = {
        active: true,
        currentWindow: true,
        url: 'https://www.vakantieveilingen.nl/*'
    };

    chrome.tabs.query(queryInfo, (tabs) => {
        if (tabs.length === 0) {
            // Not vakantie veilingen
            document.querySelector('.incorrect_site').style.display = 'block';
        } else {
            // Vakantieveilingen!
            document.querySelector('.correct_site').style.display = 'block';
        }

    });
});
