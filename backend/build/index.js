"use strict";
var matchInit = function (ctx, logger, nk, params) {
    logger.info("match initialisation");
    return {
        state: {
            board: Array(9).fill(null),
            players: [],
            turn: "X"
        },
        tickRate: 1,
        label: "tic-tac-toe"
    };
};
var matchJoin = function (ctx, logger, nk, dispatcher, tick, state, presences) {
    logger.info("presences", presences, "state", state);
    var _loop_1 = function (p) {
        var exists = state.players.find(function (pl) { return pl.userId === p.userId; });
        if (exists)
            return "continue";
        if (state.players.length >= 2)
            return "break";
        state.players.push({
            userId: p.userId,
            symbol: state.players.length === 0 ? "X" : "O"
        });
        logger.info("Player joined: " + p.userId);
    };
    for (var _i = 0, presences_1 = presences; _i < presences_1.length; _i++) {
        var p = presences_1[_i];
        var state_1 = _loop_1(p);
        if (state_1 === "break")
            break;
    }
    logger.info("Players now: " + JSON.stringify(state.players));
    dispatcher.broadcastMessage(1, JSON.stringify({
        board: state.board,
        players: state.players,
        turn: state.turn
    }));
    logger.info("Initial game state sent");
    return { state: state };
};
var matchLeave = function (ctx, logger, nk, dispatcher, tick, state, presences) {
    presences.forEach(function (p) {
        state.players = state.players.filter(function (player) { return player.userId !== p.userId; });
        logger.info("Player left: " + p.userId);
    });
    if (state.players.length === 1 && !state.winner) {
        state.winner = state.players[0].symbol;
        dispatcher.broadcastMessage(1, JSON.stringify(state));
        state.shouldTerminate = true;
    }
    if (state.players.length === 0) {
        state.winner = "no_players";
        state.shouldTerminate = true;
    }
    return { state: state };
};
var matchLoop = function (ctx, logger, nk, dispatcher, tick, state, messages) {
    messages.forEach(function (msg) {
        var data;
        if (msg.opCode === 0) {
            logger.info("State requested by: " + msg.sender.userId);
            dispatcher.broadcastMessage(1, JSON.stringify(state), [msg.sender]);
            return;
        }
        try {
            data = JSON.parse(nk.binaryToString(msg.data));
        }
        catch (e) {
            logger.warn("Invalid message format");
            return;
        }
        logger.info("Data: " + JSON.stringify(data));
        var index = data.index;
        logger.info("Index: " + index);
        if (index < 0 || index > 8) {
            logger.warn("Invalid index:", index);
            return;
        }
        if (state.winner) {
            logger.info("Game already finished");
            return;
        }
        if (state.board[index] !== null) {
            logger.warn("Cell already occupied:", index);
            return;
        }
        var player = state.players.find(function (p) { return p.userId === msg.sender.userId; });
        if (!player) {
            logger.warn("Unknown player");
            return;
        }
        if (player.symbol !== state.turn) {
            logger.warn("Not player's turn");
            return;
        }
        state.board[index] = player.symbol;
        logger.info("Move applied: ".concat(player.symbol, " at ").concat(index));
        var winner = checkWinner(state.board);
        if (winner) {
            state.winner = winner;
            logger.info("Winner:", winner);
        }
        else {
            state.turn = state.turn === "X" ? "O" : "X";
        }
        dispatcher.broadcastMessage(1, JSON.stringify(state));
    });
    if (state.shouldTerminate) {
        logger.info("Terminating match after broadcast");
        return null;
    }
    return { state: state };
};
var matchTerminate = function (ctx, logger, nk, dispatcher, tick, state, graceSeconds) {
    return { state: state };
};
var matchJoinAttempt = function (ctx, logger, nk, dispatcher, tick, state, presence, metadata) {
    logger.info("match join attempt called");
    var alreadyExists = state.players.find(function (p) { return p.userId === presence.userId; });
    if (alreadyExists) {
        logger.info("Rejecting duplicate join: " + presence.userId);
        return {
            state: state,
            accept: false,
            rejectMessage: "You are already in this match"
        };
    }
    if (state.players.length >= 2) {
        logger.info("Match full, rejecting:", presence.userId);
        return {
            state: state,
            accept: false,
            rejectMessage: "Match is full"
        };
    }
    logger.info("Player allowed:", presence.userId);
    return {
        state: state,
        accept: true
    };
};
var matchSignal = function (ctx, logger, nk, dispatcher, tick, state, data) {
    var message = data;
    logger.info("Signal received:", message);
    if (message === "reset") {
        state.board = Array(9).fill(null);
        state.turn = "X";
        state.winner = null;
        logger.info("Game reset");
    }
    return {
        state: state,
        data: data
    };
};
function checkWinner(board) {
    var wins = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    for (var _i = 0, wins_1 = wins; _i < wins_1.length; _i++) {
        var _a = wins_1[_i], a = _a[0], b = _a[1], c = _a[2];
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    return null;
}
var moduleName = "tic-tac-toe";
var createTicTacToeMatch = function (ctx, logger, nk, payload) {
    var matches = nk.matchList(10, true, "tic-tac-toe", null, 1);
    var matchId;
    if (matches.length > 0) {
        matchId = matches[0].matchId;
        logger.info("Joining existing match: " + matchId);
    }
    else {
        matchId = nk.matchCreate("tic-tac-toe", {});
        logger.info("Created new match: " + matchId);
    }
    return JSON.stringify({ matchId: matchId });
};
function InitModule(ctx, logger, nk, initializer) {
    initializer.registerMatch(moduleName, {
        matchInit: matchInit,
        matchJoin: matchJoin,
        matchJoinAttempt: matchJoinAttempt,
        matchLeave: matchLeave,
        matchLoop: matchLoop,
        matchSignal: matchSignal,
        matchTerminate: matchTerminate
    });
    initializer.registerRpc("create_tictactoe_match", createTicTacToeMatch);
    logger.info('Tic-tac-toe game JavaScript logic loaded.');
}
