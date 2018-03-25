"use strict"
const Conversation = require('../models/conversation'),
    Message = require('../models/message'),
    User = require('../models/User');

exports.getConversations = function(req, res, next) {
    // Only return one message from each conversation to display as snippet
    Conversation.find({ participants: req.user._id })
        .select('_id')
        .exec(function(err, conversations) {
            if (err) {
                res.send({ error: err });
                return next(err);
            }

            // res.status(200).json({ convos: conversations });

            // Set up empty array to hold conversations + most recent message
            let fullConversations = [];
            conversations.forEach(function(conversation) {
                Message.find({ 'conversationId': conversation._id })
                    .sort('-createdAt')
                    .limit(1)
                    .populate({
                        id: conversation._id,
                        path: "author",
                        isEmpty: false,
                        select: "profile.firstName profile.lastName"
                    })
                    .exec(function(err, message) {
                        if (err) {
                            res.send({ error: err });
                            return next(err);
                        }
                        if (message > 0) {
                            fullConversations.push(message);
                            if (fullConversations.length === conversations.length) {
                                return res.status(200).json({ conversations: fullConversations });
                            }
                        } else {
                            fullConversations.push({
                                id: conversation._id,
                                isEmpty: true
                            });
                            return res.status(200).json({ conversations: fullConversations });
                        }

                    });
            });
        });
}


exports.getConversation = function(req, res, next) {
    Message.find({ conversationId: req.params.conversationId })
        .select('createdAt body author')
        .sort('-createdAt')
        .populate({
            path: 'author',
            select: 'profile.firstName profile.lastName'
        })
        .exec(function(err, messages) {
            if (err) {
                res.send({ error: err });
                return next(err);
            }

            res.status(200).json({ conversation: messages });
        });
}

exports.sendReply = function(req, res, next) {
    const reply = new Message({
        conversationId: req.params.conversationId,
        body: req.body.composedMessage,
        author: req.user._id
    });

    reply.save(function(err, sentReply) {
        if (err) {
            res.send({ error: err });
            return next(err);
        }

        res.status(200).json({ message: 'Reply successfully sent!' });
        return (next);
    });
}
