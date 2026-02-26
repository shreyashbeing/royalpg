import Poll from "../models/Poll.model.js";
import { getIO } from "../config/socket.js";

/**
 * OWNER → CREATE POLL
 */
export const createPoll = async (req, res) => {
  try {
    const { question, options } = req.body;

    await Poll.updateMany({ isActive: true }, { isActive: false });

    const poll = await Poll.create({
      question,
      options: options.map((opt) => ({ text: opt })),
      isActive: true,
    });

    const io = getIO();
    io.emit("pollStarted", poll);

    res.status(201).json({
      message: "Poll started",
      poll,
    });
  } catch {
    res.status(500).json({ message: "Failed to create poll" });
  }
};

export const getActivePoll = async (req, res) => {
  try {
    const poll = await Poll.findOne({ isActive: true });
    res.json(poll);
  } catch {
    res.status(500).json({ message: "Failed to fetch poll" });
  }
};

export const votePoll = async (req, res) => {
  try {
    const { pollId } = req.params;
    const { optionIndex } = req.body;

    const poll = await Poll.findById(pollId);

    if (!poll || !poll.isActive) {
      return res.status(400).json({ message: "Poll not active" });
    }

    if (poll.votedUsers.includes(req.user._id)) {
      return res.status(400).json({ message: "You already voted" });
    }

    poll.options[optionIndex].votes += 1;
    poll.votedUsers.push(req.user._id);

    await poll.save();

    const io = getIO();
    io.emit("pollUpdated", poll);

    res.json({ message: "Vote submitted" });
  } catch {
    res.status(500).json({ message: "Voting failed" });
  }
};

export const endPoll = async (req, res) => {
  try {
    const { pollId } = req.params;

    const poll = await Poll.findByIdAndUpdate(
      pollId,
      { isActive: false },
      { new: true },
    );

    const io = getIO();
    io.emit("pollEnded", poll);

    res.json({
      message: "Poll ended",
      poll,
    });
  } catch {
    res.status(500).json({ message: "Failed to end poll" });
  }
};

export const getPollResult = async (req, res) => {
  try {
    const { pollId } = req.params;
    const poll = await Poll.findById(pollId);
    res.json(poll);
  } catch {
    res.status(500).json({ message: "Failed to get poll result" });
  }
};
