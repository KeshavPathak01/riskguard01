

const store = require('../store');

async function getUserRisk(req, res) {
  try {
    const { userId } = req.params;

    if (!userId || userId.trim() === '') {
      return res.status(400).json({ success: false, error: 'userId is required' });
    }

    const profile = store.getUser(userId);
    const recentTxns = store.getTransactions({ userId, limit: 10 });

    return res.status(200).json({
      success: true,
      data: {
        user_id: userId,
        lastRiskScore: profile.lastRiskScore,
        riskLevel:
          profile.lastRiskScore >= 70
            ? 'HIGH'
            : profile.lastRiskScore >= 40
            ? 'MEDIUM'
            : 'LOW',
        totalTransactions: profile.totalTransactions,
        knownDevices: profile.knownDevices,
        knownLocations: profile.knownLocations,
        failedAttempts: profile.failedAttempts,
        riskHistory: profile.riskHistory,   
        recentTransactions: recentTxns,
      },
    });
  } catch (err) {
    console.error('[RiskController] Error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function getStats(req, res) {
  try {
    const stats = store.getStats();
    return res.status(200).json({ success: true, data: stats });
  } catch (err) {
    console.error('[RiskController] Stats Error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

module.exports = { getUserRisk, getStats };
