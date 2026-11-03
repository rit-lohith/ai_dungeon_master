const validateQuest = (quest) => {
    return quest && quest.type && quest.title && quest.objective;
};

module.exports = {
    validateQuest
};
