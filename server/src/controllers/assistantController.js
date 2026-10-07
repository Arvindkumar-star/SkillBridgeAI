const assistantService = require('../services/assistant/assistantService');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const askAssistant = async (req, res) => {
  const { query, jobId } = req.body;
  if (!query || query.trim().length === 0) {
    return sendError(res, 'Query string is required', 400, 'BAD_REQUEST');
  }

  try {
    const result = await assistantService.askAssistant({
      userId: req.user._id,
      query,
      jobId
    });

    return sendSuccess(res, result);
  } catch (err) {
    return sendError(res, err.message, 500, 'ASSISTANT_FAILED');
  }
};

module.exports = {
  askAssistant
};
