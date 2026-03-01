var searchForm = document.getElementById('searchForm');
var searchBtn = document.getElementById('searchBtn');
var searchBtnText = document.getElementById('searchBtnText');
var searchTermInput = document.getElementById('searchTerm');
var resultSynonyms = document.getElementById('resultSynonyms');
var resultMessage = document.getElementById('resultMessage');

var setLoadingState = function(isLoading) {
    searchBtn.disabled = isLoading;
    searchBtnText.textContent = isLoading ? 'Searching...' : 'Search';
};

var clearSynonyms = function() {
    resultSynonyms.innerHTML = '';
};

var renderSynonymPills = function(synonyms) {
    clearSynonyms();

    if (!synonyms.length) {
        resultMessage.textContent = 'No synonyms were found for that entry.';
        return;
    }

    resultMessage.textContent = 'Related synonyms from Merriam-Webster:';

    synonyms.forEach(function(word) {
        var pill = document.createElement('span');
        pill.className = 'syn-pill';
        pill.textContent = word;
        resultSynonyms.appendChild(pill);
    });
};

var onSearchBtnClick = async function() {
    var query = searchTermInput.value.trim();

    if (!query) {
        clearSynonyms();
        resultMessage.textContent = 'Enter a word before searching the archive.';
        return;
    }

    setLoadingState(true);
    clearSynonyms();
    resultMessage.textContent = 'Searching archive...';

    try {
        var response = await fetch(`/api/synonyms?word=${encodeURIComponent(query)}`);
        var data = await response.json();

        if (response.ok) {
            var synonyms = [];

            if (data[0] && data[0].meta && Array.isArray(data[0].meta.syns)) {
                synonyms = data[0].meta.syns.flat().filter(Boolean);
            }

            renderSynonymPills(synonyms);
            setLoadingState(false);
            return;
        }

        setLoadingState(false);
        clearSynonyms();
        resultMessage.textContent = data.error || 'Unable to fetch synonyms right now. Please try again.';
    } catch (error) {
        setLoadingState(false);
        clearSynonyms();
        resultMessage.textContent = 'Network error while fetching synonyms. Please retry.';
    }
};

searchForm.addEventListener('submit', function(event) {
    event.preventDefault();
    onSearchBtnClick();
});


