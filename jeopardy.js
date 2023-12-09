let categories = [];

async function getCategoryIds() {
    try {
        const response = await $.ajax({
            url: 'https://jservice.io/api/categories',
            data: { count: 6 },
            dataType: 'json'
        });
        return response.map(category => category.id);
    } catch (error) {
        console.error('Error in getCategoryIds:', error);
        throw error;
    }
}

async function getCategory(catId) {
    try {
        const response = await $.ajax({
            url: `https://jservice.io/api/category?id=${catId}`,
            dataType: 'json'
        });

        const clues = response.clues.map(clue => ({
            question: clue.question,
            answer: clue.answer,
            showing: null
        }));

        return {
            title: response.title,
            clues: clues
        };
    } catch (error) {
        console.error('Error in getCategory:', error);
        throw error;
    }
}

function fillCard() {
    try {
        const cardElement = $('#jeopardy');
        cardElement.empty();

        categories.forEach(category => {
            const cardContainer = $('<div>').addClass('card-container');
            const cardHeader = $('<div>').addClass('card-header').text(category.title);
            const cardBody = $('<div>').addClass('card-body').text(category.clues[0].question);
            const cardFooter = $('<div>').addClass('card-footer').text(category.clues[0].answer).hide();

            cardContainer.append(cardHeader, cardBody, cardFooter);
            cardElement.append(cardContainer);
        });
    } catch (error) {
        console.error('Error in fillCard:', error);
    }
}

function handleClick(evt) {
    try {
        const clickedCard = $(evt.target).closest('.card-container');
        const cardFooter = clickedCard.find('.card-footer');

        if (cardFooter.is(':hidden')) {
            cardFooter.show();
        } else {
            const categoryIndex = clickedCard.index();
            const category = categories[categoryIndex];
            const currentClueIndex = category.clues.findIndex(clue => clue.showing === null);

            if (currentClueIndex !== -1) {
                const nextClue = category.clues[currentClueIndex + 1];
                if (nextClue) {
                    const cardBody = clickedCard.find('.card-body');
                    cardBody.text(nextClue.question);
                    nextClue.showing = null;
                    cardFooter.hide();
                } else {
                    alert('No more clues in this category.');
                }
            } else {
                alert('All clues in this category have been shown.');
            }
        }
    } catch (error) {
        console.error('Error in handleClick:', error);
    }
}

function showLoadingView() {
    $('#loading-spinner').show();
    $('#start-restart-btn').attr('disabled', true).text('Loading...');
}

function hideLoadingView() {
    $('#loading-spinner').hide();
    $('#start-restart-btn').attr('disabled', false).text('Restart Game');
}

async function setupAndStart() {
    try {
        showLoadingView();

        const categoryIds = await getCategoryIds();
        categories = await Promise.all(categoryIds.map(getCategory));

        fillCard();

        hideLoadingView();
    } catch (error) {
        console.error('Error in setupAndStart:', error);
        hideLoadingView();
        alert('Failed to start the game. Please try again.');
    }
}

$(document).ready(function () {
    $('#jeopardy').on('click', '.card-container', handleClick);

    $('#start-restart-btn').on('click', function () {
        setupAndStart();
    });
});