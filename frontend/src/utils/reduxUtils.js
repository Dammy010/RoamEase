/**
 * Utility function to safely dispatch Redux actions
 * Handles both async thunks (with unwrap) and regular actions
 * @param {Function} dispatch - Redux dispatch function
 * @param {Function} action - Redux action to dispatch
 * @param {Object} options - Options for error handling
 * @returns {Promise} - Promise that resolves when action completes
 */
export const safeDispatch = async (dispatch, action, options = {}) => {
  const { onError = null, onSuccess = null, logPrefix = "Action" } = options;

  try {
    console.log(`🔄 ${logPrefix} dispatched`);
    const result = await dispatch(action);

    // Check if it's an async thunk with unwrap method
    if (result && typeof result.unwrap === "function") {
      const unwrappedResult = await result.unwrap();
      console.log(`✅ ${logPrefix} completed successfully`);

      if (onSuccess) {
        onSuccess(unwrappedResult);
      }

      return unwrappedResult;
    } else {
      // Regular synchronous action
      console.log(`✅ ${logPrefix} completed successfully`);

      if (onSuccess) {
        onSuccess(result);
      }

      return result;
    }
  } catch (error) {
    console.error(`❌ ${logPrefix} failed:`, error.message);

    if (onError) {
      onError(error);
    }

    throw error;
  }
};

/**
 * Utility function to dispatch multiple actions with proper error handling
 * @param {Function} dispatch - Redux dispatch function
 * @param {Array} actions - Array of actions to dispatch
 * @param {Object} options - Options for error handling
 * @returns {Promise} - Promise that resolves when all actions complete
 */
export const safeDispatchMultiple = async (dispatch, actions, options = {}) => {
  const {
    onError = null,
    onSuccess = null,
    logPrefix = "Multiple actions",
    continueOnError = true,
  } = options;

  const results = [];
  const errors = [];

  try {
    console.log(`🔄 ${logPrefix} started (${actions.length} actions)`);

    for (let i = 0; i < actions.length; i++) {
      const action = actions[i];
      try {
        const result = await safeDispatch(dispatch, action, {
          logPrefix: `Action ${i + 1}/${actions.length}`,
          onError: (error) => {
            errors.push({ index: i, action, error });
            if (!continueOnError) {
              throw error;
            }
          },
        });
        results.push({ index: i, action, result });
      } catch (error) {
        errors.push({ index: i, action, error });
        if (!continueOnError) {
          throw error;
        }
      }
    }

    console.log(
      `✅ ${logPrefix} completed (${results.length} successful, ${errors.length} failed)`
    );

    if (onSuccess) {
      onSuccess(results);
    }

    if (errors.length > 0 && onError) {
      onError(errors);
    }

    return { results, errors };
  } catch (error) {
    console.error(`❌ ${logPrefix} failed:`, error.message);

    if (onError) {
      onError(error);
    }

    throw error;
  }
};

/**
 * Utility function to dispatch actions with delays between them
 * Useful for preventing rate limiting
 * @param {Function} dispatch - Redux dispatch function
 * @param {Array} actionConfigs - Array of { action, delay } objects
 * @param {Object} options - Options for error handling
 * @returns {Promise} - Promise that resolves when all actions complete
 */
export const safeDispatchWithDelays = async (
  dispatch,
  actionConfigs,
  options = {}
) => {
  const {
    onError = null,
    onSuccess = null,
    logPrefix = "Delayed actions",
  } = options;

  const results = [];
  const errors = [];

  try {
    console.log(`🔄 ${logPrefix} started (${actionConfigs.length} actions)`);

    for (let i = 0; i < actionConfigs.length; i++) {
      const { action, delay = 0 } = actionConfigs[i];

      // Wait for the specified delay (except for the first action)
      if (i > 0 && delay > 0) {
        console.log(`⏳ Waiting ${delay}ms before next action...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }

      try {
        const result = await safeDispatch(dispatch, action, {
          logPrefix: `Action ${i + 1}/${actionConfigs.length}`,
          onError: (error) => {
            errors.push({ index: i, action, error });
          },
        });
        results.push({ index: i, action, result });
      } catch (error) {
        errors.push({ index: i, action, error });
      }
    }

    console.log(
      `✅ ${logPrefix} completed (${results.length} successful, ${errors.length} failed)`
    );

    if (onSuccess) {
      onSuccess(results);
    }

    if (errors.length > 0 && onError) {
      onError(errors);
    }

    return { results, errors };
  } catch (error) {
    console.error(`❌ ${logPrefix} failed:`, error.message);

    if (onError) {
      onError(error);
    }

    throw error;
  }
};

export default safeDispatch;
