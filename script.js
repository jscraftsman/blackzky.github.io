/*global $ */
/*global console */
/*global alert */
/*global APP */
/*global VOCABULARY */
/*global KANJI */

var SETTINGS = {
    DEFAULT_NEW: 2,
    DEFAULT_REVIEW: 3
};
var WORD_TYPE = {
    0: "Noun",
    1: "Verb I",
    2: "Verb II",
    3: "Verb III",
    4: "Adjective"
};
var SCREEN = {
    MENU: "Menu",
    STUDY: "Study",
    BROWSE: "Browse",
    IMPORT: "Import",
    EXPORT: "Export",
    FRONT_CARD: "Front-Card",
    BACK_CARD: "Back-Card",
    KANJI_CARD: "Kanji-Card"
};

$(document).ready(function () {
    "use strict";
    APP.SetScreen(SCREEN.MENU);
});

(function (app) {
    "use strict";
    var CURRENT_SCREEN = null,
        LAST_SCREEN = null,
        STUDY_DECK_OBJECT = {},
        STUDY_DECK_ARRAY = [];
    
    /* Shuffle Array */
    function shuffle(array) {
        var currentIndex = array.length, temporaryValue, randomIndex;
        // While there remain elements to shuffle...
        while (currentIndex !== 0) {
            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    }
    function initScreen(screen) {
        switch (screen) {
        case SCREEN.STUDY:
            $("#new_card_count").val(SETTINGS.DEFAULT_NEW);
            $("#review_card_count").val(SETTINGS.DEFAULT_REVIEW);
            break;
        case SCREEN.FRONT_CARD:
            /*global renderFrontCard */
            renderFrontCard();
            break;
        case SCREEN.BACK_CARD:
            /*global renderBackCard */
            renderBackCard();
            break;
        default:
            break;
        }
    }
    function getNewCards() {
        var newCards = [],
            newCardsFound = 0,
            i = 0;
        for (i in VOCABULARY) {
            if (VOCABULARY.hasOwnProperty(i)) {
                if (newCardsFound >= SETTINGS.DEFAULT_NEW) {
                    break;
                }
                if (VOCABULARY[i].PROGRESS === 0) {
                    newCards.push(i);
                    newCardsFound += 1;
                }
            }
        }
        return newCards;
    }
    function getReviewCards() {
        var reviewCards = [],
            reviewCardsFound = 0,
            i = 0;
        for (i in VOCABULARY) {
            if (VOCABULARY.hasOwnProperty(i)) {
                if (reviewCardsFound >= SETTINGS.DEFAULT_REVIEW) {
                    break;
                }
                /* Temporary implementation, use complex algo later */
                /* Get cards with progress by percentage: 45% 25% 15% 10% 5% */
                if (VOCABULARY[i].PROGRESS > 0) {
                    reviewCards.push(i);
                    reviewCardsFound += 1;
                }
            }
        }
        return reviewCards;
    }
    function renderFrontCard() {
        if (STUDY_DECK_ARRAY.length > 0) {
            var card_index = STUDY_DECK_ARRAY[0];
            if (card_index) {
                $("#front-card-lexeme").text(VOCABULARY[card_index].LEXEME);
            }
            /*global renderDeckStats */
            renderDeckStats();
        } else {
            alert("Study Complete!"); // ############ DEBUG #############
            APP.SetScreen(SCREEN.MENU);
        }
        
    }
    function renderBackCard() {
        var card_index = STUDY_DECK_ARRAY[0],
            list = "",
            kanji = "",
            kanji_meaning = "",
            kanji_link = "",
            i;
        
        if (card_index) {
            $("#back-card-lexeme").text(VOCABULARY[card_index].LEXEME);
            $("#back-card-meaning").text(VOCABULARY[card_index].MEANING);
            $("#back-card-reading").text(VOCABULARY[card_index].READING);
            $("#back-card-type").text(VOCABULARY[card_index].TYPE);
            $("#back-card-progress").text(VOCABULARY[card_index].PROGRESS);
            
            if (VOCABULARY[card_index].KANJIS.length > 0) {
                for (i in VOCABULARY[card_index].KANJIS) {
                    if (VOCABULARY[card_index].KANJIS.hasOwnProperty(i)) {
                        kanji = VOCABULARY[card_index].KANJIS[i];
                        kanji_meaning = KANJI[kanji].MEANING;
                        kanji_link = "<a href='#' onClick='APP.ViewKanji(\"" + kanji + "\");'>" + kanji + "</a>";
                        list += ("<li>" + kanji_link + " [" + kanji_meaning + "]</li>");
                    }
                }
                $("#back-card-kanjis").html(list);
            } else {
                $("#back-card-kanjis").html("No Kanji available");
            }
        }
        /*global renderDeckStats */
        renderDeckStats();
    }
    function renderDeckStats() {
        $(".deck-stats-new").text(STUDY_DECK_OBJECT.NEW_CARDS.length);
        $(".deck-stats-learning").text(STUDY_DECK_OBJECT.LEARNING_CARDS.length);
        $(".deck-stats-review").text(STUDY_DECK_OBJECT.REVIEW_CARDS.length);
    }
    function studyDeckToArray() {
        STUDY_DECK_ARRAY = STUDY_DECK_OBJECT.NEW_CARDS.concat(STUDY_DECK_OBJECT.REVIEW_CARDS);
        STUDY_DECK_ARRAY = STUDY_DECK_ARRAY.concat(STUDY_DECK_OBJECT.LEARNING_CARDS);
        STUDY_DECK_ARRAY = shuffle(STUDY_DECK_ARRAY);
    }
    
    app.StartStudy = function () {
        STUDY_DECK_OBJECT.NEW_CARDS = getNewCards();
        STUDY_DECK_OBJECT.REVIEW_CARDS = getReviewCards();
        STUDY_DECK_OBJECT.LEARNING_CARDS = [];
        
        studyDeckToArray();

        this.SetScreen(SCREEN.FRONT_CARD, SCREEN.STUDY);
        initScreen(SCREEN.FRONT_CARD);
    };
    app.FlipCard = function () {
        this.SetScreen(SCREEN.BACK_CARD, SCREEN.FRONT_CARD);
        initScreen(SCREEN.BACK_CARD);
    };
    app.SetCardAsAgain = function () {
        var card_index = STUDY_DECK_ARRAY[0];
        if (card_index) {
            VOCABULARY[card_index].PROGRESS = 1;
            if (STUDY_DECK_OBJECT.NEW_CARDS.indexOf(card_index) !== -1) {
                STUDY_DECK_OBJECT.NEW_CARDS.splice(STUDY_DECK_OBJECT.NEW_CARDS.indexOf(card_index), 1);
                STUDY_DECK_OBJECT.LEARNING_CARDS.push(card_index);
            } else if (STUDY_DECK_OBJECT.REVIEW_CARDS.indexOf(card_index) !== -1) {
                STUDY_DECK_OBJECT.REVIEW_CARDS.splice(STUDY_DECK_OBJECT.REVIEW_CARDS.indexOf(card_index), 1);
                STUDY_DECK_OBJECT.LEARNING_CARDS.push(card_index);
            }
            
            studyDeckToArray();
            this.SetScreen(SCREEN.FRONT_CARD, SCREEN.STUDY);
            initScreen(SCREEN.FRONT_CARD);
        }
    };
    app.SetCardAsGood = function () {
        var card_index = STUDY_DECK_ARRAY[0];
        if (card_index) {
            if (VOCABULARY[card_index].PROGRESS < 5) {
                VOCABULARY[card_index].PROGRESS += 1;
            }
            if (STUDY_DECK_OBJECT.NEW_CARDS.indexOf(card_index) !== -1) {
                STUDY_DECK_OBJECT.NEW_CARDS.splice(STUDY_DECK_OBJECT.NEW_CARDS.indexOf(card_index), 1);
            } else if (STUDY_DECK_OBJECT.LEARNING_CARDS.indexOf(card_index) !== -1) {
                STUDY_DECK_OBJECT.LEARNING_CARDS.splice(STUDY_DECK_OBJECT.LEARNING_CARDS.indexOf(card_index), 1);
            } else if (STUDY_DECK_OBJECT.REVIEW_CARDS.indexOf(card_index) !== -1) {
                STUDY_DECK_OBJECT.REVIEW_CARDS.splice(STUDY_DECK_OBJECT.REVIEW_CARDS.indexOf(card_index), 1);
            }
            
            studyDeckToArray();
            
            this.SetScreen(SCREEN.FRONT_CARD, SCREEN.STUDY);
            initScreen(SCREEN.FRONT_CARD);
        }
    };
    app.ViewKanji = function (kanji) {
        this.SetScreen(SCREEN.KANJI_CARD, SCREEN.FRONT_CARD);
        $("#kanji-card-lexeme").text(kanji);
        $("#kanji-card-meaning").text(KANJI[kanji].MEANING);
        $("#kanji-card-onyomi").text(KANJI[kanji].ON);
        $("#kanji-card-kunyomi").text(KANJI[kanji].KUN);
    };
    app.SetScreen = function (new_screen, current) {
        CURRENT_SCREEN = new_screen;
        LAST_SCREEN = current;
        $(".screen").hide();
        new_screen = new_screen || SCREEN.MENU;
        $("#" + new_screen).show();
        initScreen(new_screen);
    };
}(this.APP = this.APP || {}));



var VOCABULARY = {
    0: {
        LEXEME: "会う",
        MEANING: "to meet",
        READING: "あう",
        TYPE: 0,
        PROGRESS: 0,
        KANJIS: ["会"]
    },
    1: {
        LEXEME: "会う",
        MEANING: "1",
        READING: "あう",
        TYPE: 0,
        PROGRESS: 0,
        KANJIS: ["会", "会"]
    },
    2: {
        LEXEME: "会う",
        MEANING: "2",
        READING: "あう",
        TYPE: 0,
        PROGRESS: 0,
        KANJIS: ["会"]
    },
    3: {
        LEXEME: "会う",
        MEANING: "3",
        READING: "あう",
        TYPE: 0,
        PROGRESS: 0,
        KANJIS: ["会"]
    },
    4: {
        LEXEME: "会う",
        MEANING: "4",
        READING: "あう",
        TYPE: 0,
        PROGRESS: 0,
        KANJIS: ["会"]
    },
    5: {
        LEXEME: "会う",
        MEANING: "5",
        READING: "あう",
        TYPE: 0,
        PROGRESS: 0,
        KANJIS: []
    },
    6: {
        LEXEME: "会う",
        MEANING: "6",
        READING: "あう",
        TYPE: 0,
        PROGRESS: 1,
        KANJIS: []
    },
    7: {
        LEXEME: "会う",
        MEANING: "7",
        READING: "あう",
        TYPE: 0,
        PROGRESS: 1,
        KANJIS: []
    },
    8: {
        LEXEME: "会う",
        MEANING: "8",
        READING: "あう",
        TYPE: 0,
        PROGRESS: 1,
        KANJIS: []
    },
    9: {
        LEXEME: "会う",
        MEANING: "9",
        READING: "あう",
        TYPE: 0,
        PROGRESS: 1,
        KANJIS: []
    },
    10: {
        LEXEME: "会う",
        MEANING: "10",
        READING: "あう",
        TYPE: 0,
        PROGRESS: 1,
        KANJIS: []
    },
    11: {
        LEXEME: "会う",
        MEANING: "11",
        READING: "あう",
        TYPE: 0,
        PROGRESS: 1,
        KANJIS: []
    },
    100: {
        LEXEME: "あさって",
        MEANING: "day after tomorrow",
        READING: "あさって",
        TYPE: 0,
        PROGRESS: 0,
        KANJIS: []
    }
};
var KANJI = {
    "会": {
        MEANING: "meeting;  meet;  party;  association;  interview;  join",
        ON: "カイ",
        KUN: "あ.う"
    }
};

//http://tangorin.com/
// TODO
// Browse Screen: List Vocab, Search Vocab (lexeme, reading, meaning)
// Import Option
// Export Option