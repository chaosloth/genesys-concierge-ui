/*!
 * @license Genesys WebRTC Service JSAPI
 * @version 1.0.0
 * Copyright (c) 2013 Genesys Telecommunications Laboratories, Inc.
 * All rights reserved.
 */

/*!
 * Portions of this software is based on http://code.google.com/p/webrtc-samples/
 * and it is covered by the following:
 *
 * Copyright (C) 2012 Google.
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *    * Redistributions of source code must retain the above copyright
 *      notice, this list of conditions and the following disclaimer.
 *    * Redistributions in binary form must reproduce the above copyright
 *      notice, this list of conditions and the following disclaimer in the
 *      documentation and/or other materials provided with the distribution.
 *    * Neither the name of Google nor the
 *      names of its contributors may be used to endorse or promote products
 *      derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL GOOGLE BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/*
 * Wrap everything in an anonymous closure and export Grtc as the only global.
 */
(function (window, navigator, document, $, undefined) {

"use strict";

/*jslint bitwise: true */

// -------------------- adaptor.js polyfill --------------------

/* This section generalizes the API across different browsers for
 * using WebRTC functionality. It is based on the adaptor.js
 * polyfill from http://code.google.com/p/webrtc-samples/. */

navigator.getUserMedia = (
    navigator.mozGetUserMedia ||    // firefox API
    navigator.webkitGetUserMedia || // chrome API
    navigator.getUserMedia ||       // opera API
    navigator.msGetUserMedia        // IE API (NA as of 2013-06)
);

var URL = (
    window.URL ||
    window.webkitURL
);

var RTCPeerConnection = (
    window.mozRTCPeerConnection ||
    window.webkitRTCPeerConnection ||
    window.RTCPeerConnection
);

var RTCSessionDescription = (
    window.mozRTCSessionDescription ||
    window.RTCSessionDescription
);

var RTCIceCandidate = (
    window.mozRTCIceCandidate ||
    window.RTCIceCandidate
);

var MediaStream = (
    window.mozMediaStream ||
    window.webkitMediaStream ||
    window.MediaStream
);

// all the required objects should have been defined

if (MediaStream && MediaStream.prototype && !MediaStream.prototype.getAudioTracks) {
    // getViewTracks method not defined
    if (MediaStream.prototype.audioTracks) {
        // audioTracks property is defined: chrome 25 or lower
        MediaStream.prototype.getAudioTracks = function() {
            return this.audioTracks;
        };
    } else {
        // firefox or others
        MediaStream.prototype.getAudioTracks = function() {
            return [];
        };
    }
}

if (MediaStream && MediaStream.prototype && !MediaStream.prototype.getVideoTracks) {
    // getViewTracks method not defined
    if (MediaStream.prototype.videoTracks) {
        // videoTracks property is defined: chrome 25 or below
        MediaStream.prototype.getVideoTracks = function() {
            return this.videoTracks;
        };
    } else {
        // firefox or others
        MediaStream.prototype.getVideoTracks = function() {
            return [];
        };
    }
}

// -------------------- END of adaptor.js polyfill --------------------

// -------------------- Class Grtc --------------------

// This is the Grtc class and the only variable to be exported
// It is a singleton class and is not supposed to be instantiated
var Grtc = {};

// When an error is thrown by Grtc code, these are the keywords for the client
// to identify what error has happened
Grtc.CONFIGURATION_ERROR         = "CONFIGURATION_ERROR";
Grtc.CONNECTION_ERROR            = "CONNECTION_ERROR";
Grtc.WEBRTC_NOT_SUPPORTED_ERROR  = "WEBRTC_NOT_SUPPORTED_ERROR";
Grtc.INVALID_STATE_ERROR         = "INVALID_STATE_ERROR";
Grtc.NOT_READY_ERROR             = "NOT_READY_ERROR";
Grtc.GRTC_ERROR                  = "ERROR";   // Generic error
Grtc.GRTC_WARN                   = "WARNING"; // Generic warning

/* Static method to check whether WebRTC is supported by a browser. */
Grtc.isWebrtcSupported = function () {
    return !!RTCPeerConnection;
};

// -------------------- Utility functions --------------------

/* Utility (private) function to generate a 36-character sequence. */
function generateUUID () {
    var maxInt = 2147483647; // Math.pow(2,31)-1
    // Number of milliseconds since 1970-01-01 (should be greater than maxInt)
    var timestamp = new Date().getTime();
    var uuid = "anonxxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".replace(/[xy]/g,
        function (c) {
            // Takes the 4 least significant bits of timestamp (plus a random additive)
            var randomN = (timestamp + Math.random()*maxInt) & 0xf;
            // Prepare for the next round (note: using shift operator may cause
            // lost of information since shift in javascript works on 32bit number
            // and timestamp is greater than that)
            timestamp = timestamp / 2 | 0;
            // Replace x with randomN and y with 1--- where - is one of the
            // 3 least significant bits of randomN (use base16 representation)
            return (c === "x" ? randomN : (randomN & 0x7 | 0x8)).toString(16);
        }
    );
    return uuid;
}

// -------------------- Class Grtc.Logger --------------------

/* Logger class used to log error messages.
 * Not making it a closure since there is not much to encapsulate. */
Grtc.Logger = function (e) {
    // The HTML container element the logs should be sent to.
    // If set to null or invalid, logs are sent to web console by default
    this.element = null;
    if (e && e.nodeType) {
        this.element = e;
    }
};

/* Log message to the container element if valid; otherwise log to console.
 * If exception object is specified, its description field is also logged. */
Grtc.Logger.prototype.log = function (message, exception) {
    var s = "grtc";
    if (window.performance && window.performance.now) {
        s += (": " + (window.performance.now() / 1000).toFixed(3));
    }
    if (message) {
        s += (": " + message);
    }
    if (exception && exception.message) {
        s += (": " + exception.message);
    }

    if (this.element && this.element.innerHTML) {
        this.element.innerHTML += (s + "<br/>");
    } else {
        if (window.console && window.console.log) {
            window.console.log(s);
        }
    }
};

// default logger used by Grtc internally
var gLogger = new Grtc.Logger();

/* User can set gLogger to another instance of Grtc.Logger. */
Grtc.setLogger = function (logger) {
    if (logger && (logger.constructor === Grtc.Logger)) {
        gLogger = logger;
    }
};

// -------------------- END of Class Grtc.Logger --------------------

// -------------------- Class Grtc.Error --------------------

/* Error class used to customize errors thrown by Grtc functions.
 * Not making it a closure since there is not much to encapsulate. */
Grtc.Error = function (t, m) {
    this.name = (typeof t === "undefined") ? Grtc.GRTC_ERROR : t; 
    this.message = "";
    if (m) {
        this.message = m;
    }
};

// -------------------- END of Class Grtc.Error --------------------

var registeredSSID = -1; // Represents the Unique Server-Side ID received 
                         // by client from Gateway after sign-in
var disconnecting = false;
var CALL_STATE_NOT_STARTED = 0;
var CALL_STATE_ONGOING = 1;
var callState = CALL_STATE_NOT_STARTED;
var pcDest = null; // PeerConnection destination DN
var localStream = null;
var incomingMsg = null;

// -------------------- Class Grtc.Client --------------------

/*
 * The Client class represents a user agent (browser) that can
 * connect/disconnect/register against the WebRTC gateway.
 *
 * This class is encapsulated in an anonymous closure and exported as a
 * property of Grtc.
 *
 * - configuration: contains a list of mandatory and optional properties
 *   used to establish connection with the WebRTC gateway.
 * - publicId     : is a unique ID to identify each client.
 * - mediaSession : is a reference to the Grtc.MediaSession instance.
 */
(function () {

var GRTC_PARAMETERS = [
    "webrtc_gateway",
    "stun_server",
    "turn_server",
    "turn_username",
    "turn_password",
    "sip_username",
    "sip_password",
    "dtls_srtp"
];

// This is the Grtc.Client class to be exported
var gClient = function (configObj) {
    // configObj is the configuration object that should contain some
    // mandatory properties and optional properties. Need to check it
    // is well formed
    var isWellFormed = true;
    if (configObj && typeof configObj === "object") {
        // "webrtc_gateway" is mandatory
        if (!configObj.hasOwnProperty("webrtc_gateway")) {
            gLogger.log(Grtc.CONFIGURATION_ERROR +
                ": mandatory parameter is not specified: webrtc_gateway");
            isWellFormed = false;
        }
        // either "stun_server" or "turn_server" must be specified
        if (!configObj.hasOwnProperty("stun_server") &&
            !configObj.hasOwnProperty("turn_server")) {
            gLogger.log(Grtc.CONFIGURATION_ERROR +
                ": at least one ICE server must be specified: " +
                "stun_server or turn_server");
            isWellFormed = false;
        }
        // turn_username and turn_password needed when turn_server is specified
        if (configObj.hasOwnProperty("turn_server")) {
            if (!configObj.hasOwnProperty("turn_username")) {
                gLogger.log(Grtc.CONFIGURATION_ERROR +
                    ": parameter must be specified: turn_username");
                isWellFormed = false;
            }
            if (!configObj.hasOwnProperty("turn_password")) {
                gLogger.log(Grtc.CONFIGURATION_ERROR +
                    ": parameter must be specified: turn_password");
                isWellFormed = false;
            }
        }

        // each property defined in configObj shall be valid
        for (var p in configObj) {
            if ($.inArray(p, GRTC_PARAMETERS)<0) {
                gLogger.log(Grtc.CONFIGURATION_ERROR +
                    ": parameter specified is not valid: " + p);
                isWellFormed = false;
            }
        }
    } else {
        isWellFormed = false;
    }

    if (isWellFormed) {
        this.configuration = configObj;
    } else {
        gLogger.log(Grtc.CONFIGURATION_ERROR +
            ": configuration object is not well formed");
        throw new Grtc.Error(Grtc.CONFIGURATION_ERROR,
            "configuration object is not well formed");
    }

    this.publicId = generateUUID();
    this.mediaSession = null;

    // Default access permission to local audio and video streams
    this.audioConstraints = true;
    this.videoConstraints = true; //{"mandatory": {}, "optional": []};

    this.onConnect      = $.Callbacks();
    this.onDisconnect   = $.Callbacks();
    this.onRegister     = $.Callbacks();
    this.onFailed       = $.Callbacks();
    this.onIncomingCall = $.Callbacks();
    this.onMediaSuccess = $.Callbacks();
    this.onMediaFailure = $.Callbacks();
    this.onPeerClosing  = $.Callbacks();
    this.onInvite       = $.Callbacks();
};

/* Send the sign_in request: common for connect and register. */
function doConnect (objClient) {
    var objGet = null;
    try {
        var queryurl = objClient.configuration.webrtc_gateway +
            "/sign_in?" + objClient.publicId;
        gLogger.log("Initializing: " + queryurl);
        objGet = $.get(queryurl, function (data) {
            try {
                var peers = data.split("\n");
                registeredSSID = peers[0].split("=")[1];
                gLogger.log("Server-Side ID: " + registeredSSID);
                startHangingGet(objClient);
            } catch (e) {
                // Originally thought throwing an error here is sufficient.
                // It turned out not working since we do not control who
                // triggers "onreadystatechange" event (guess the browser?)
                // so the error was not caught properly

                // So instead, we can notify the client by firing an event;
                // and the client is expected to handle the event by notifying
                // the user about the error

                // One method is to use DOM events handling:
                // createEvent/initEvent/dispatchEvent plus client side
                // handling using addEventListener. The jQuery equivalent
                // are methods trigger/on

                // To avoid DOM events on the library side, it is recommended to use
                // $.Callbacks plus fire/add in jQuery
                gLogger.log("Connection attempt to WebRTC Gateway has failed", e);
                objClient.onFailed.fire({
                    message: "Connection attempt to WebRTC Gateway has failed"
                });
            }
        });
    } catch (e) {
        gLogger.log(Grtc.CONNECTION_ERROR + ": sign-in failed", e);
        throw new Grtc.Error(Grtc.CONNECTION_ERROR, "exception during sign-in");
    }
    return objGet;
}

/* Send the sign_in request: common for connect and register. */
function doAuthenticate (objClient) {
    var objGet = null;
    try {
        var queryurl = objClient.configuration.webrtc_gateway + "/sign_in";
        var postData = objClient.publicId + ":" + objClient.configuration.sip_password;
        gLogger.log("Initializing: " + queryurl); // we don't print password
        objGet = $.post(queryurl, postData, function (data) {
            try {
                var peers = data.split("\n");
                registeredSSID = peers[0].split("=")[1];
                gLogger.log("Server-Side ID: " + registeredSSID);
                startHangingGet(objClient);
            } catch (e) {
                // Originally thought throwing an error here is sufficient.
                // It turned out not working since we do not control who
                // triggers "onreadystatechange" event (guess the browser?)
                // so the error was not caught properly

                // So instead, we can notify the client by firing an event;
                // and the client is expected to handle the event by notifying
                // the user about the error

                // One method is to use DOM events handling:
                // createEvent/initEvent/dispatchEvent plus client side
                // handling using addEventListener. The jQuery equivalent
                // are methods trigger/on

                // To avoid DOM events on the library side, it is recommended to use
                // $.Callbacks plus fire/add in jQuery
                gLogger.log("Connection attempt to WebRTC Gateway has failed", e);
                objClient.onFailed.fire({
                    message: "Connection attempt to WebRTC Gateway has failed"
                });
            }
        });
    } catch (e) {
        gLogger.log(Grtc.CONNECTION_ERROR + ": authentication failed", e);
        throw new Grtc.Error(Grtc.CONNECTION_ERROR, "exception during authentication");
    }
    return objGet;
}

/* Connect to WebRTC gateway. */
gClient.prototype.connect = function () {
    var obj = this;

    // Send the sign_in request
    var objGet = doConnect(this);

    // Notify the client by firing an event; the client can handle the
    // event by making a call
    if (objGet) {
        objGet.done(function () {
            obj.onConnect.fire({
                message: "Connection attempt to WebRTC Gateway is successful"
            });
        }).fail(function () {
            obj.onFailed.fire({
                message: "Connection attempt to WebRTC Gateway has failed"
            });
            gLogger.log(Grtc.CONNECTION_ERROR + ": connection failed");
            throw new Grtc.Error(Grtc.CONNECTION_ERROR, "exception during connection");
        });
    }
};

/* Disconnect from WebRTC gateway. */
gClient.prototype.disconnect = function () {
    doSignOut(this);

    // Reset publicId
    this.publicId = generateUUID();

    this.onDisconnect.fire({
        message: "Client is disconnected from WebRTC Gateway"
    });
};

/* register is fundamentally connect but with a user specified ID (localId argument). 
 * If sip_username is specified in configuration and localId argument is not specified, 
 * then sip_username is used as publicId. */
gClient.prototype.register = function (localId) {
    // Always disconnect first
    this.disconnect();
    // The difference between register and connect is that register has a
    // user specified ID while connect is using a randomly generated ID
    if (typeof localId !== 'undefined') {
        this.publicId = localId;
    } else if (this.configuration.sip_username) {
        this.publicId = this.configuration.sip_username;
    } else {
        gLogger.log(Grtc.GRTC_ERROR + ": user specified id missing for registration");
        throw new Grtc.Error(Grtc.GRTC_ERROR, "user specified id missing for registration");
    }

    var obj = this;

    // Send the sign_in request
    var objGet = null;
    if (this.configuration.sip_password) {
        // authenticate
        objGet = doAuthenticate(this);
    } else {
        // without authentication
        objGet = doConnect(this);
    }

    objGet.done(function () {
        obj.onRegister.fire({
            message: "Registration attempt to WebRTC Gateway is successful"
        });
    }).fail(function () {
        obj.onFailed.fire({
            message: "Registration attempt to WebRTC Gateway has failed"
        });
        gLogger.log(Grtc.CONNECTION_ERROR + ": registration failed");
        throw new Grtc.Error(Grtc.CONNECTION_ERROR, "exception during registration");
    });
};

/* Ask the user to grant access to camera and microphone
 * audioConstraints (optional): true (default), false, or an object
 * videoConstraints (optional): true (default), false, or an object
 *
 * This functionality will be moved to MediaSession in the future. */
gClient.prototype.enableMediaSource = function (audioConstraints, videoConstraints) {
    var obj = this;

    // Save user specified constraints for later use
    // Default is true for both constraints
    if (typeof audioConstraints !== "undefined") {
        this.audioConstraints = audioConstraints;
    }
    if (typeof videoConstraints !== "undefined") {
        this.videoConstraints = videoConstraints;
    }

    // User specified constraints will be passed to getUserMedia directly
    var permission = {audio: this.audioConstraints, video: this.videoConstraints};
    gLogger.log("Requested access to local media with mediaConstraints: " + JSON.stringify(permission));

    try {
        // Using new permission format
        navigator.getUserMedia(
            permission,
            function (s) {
                localStream = s;
                gLogger.log("User has granted access to local media");
                obj.onMediaSuccess.fire({
                    stream: s
                });
            },
            function (gumError) {
                gLogger.log(Grtc.GRTC_ERROR + ": Attempt to access local media has failed: " + JSON.stringify(gumError));
                obj.onMediaFailure.fire({
                    message: "Attempt to access local media has failed"
                });
            }
        );
    } catch (e) {
        gLogger.log(Grtc.GRTC_ERROR + ": Attempt to access local media has failed",e);
        obj.onMediaFailure.fire({
            message: "Attempt to access local media has failed"
        });
    }
};

/* Stop the local media source. */
gClient.prototype.disableMediaSource = function () {
    localStream.stop();
};

/* Set the HTML container element (sink) for the specified media stream.
 * element: the <audio> or <video> container element of the media
 * stream: the stream to be attached
 *
 * This functionality will be moved to MediaSession in the future. */
gClient.prototype.setViewFromStream = function (element, stream) {
    if (element && element.nodeType && stream) {
        if (typeof element.srcObject !== 'undefined') {
            // eventually both chrome and firefox will support this
            element.srcObject = stream;
            element.play();
        } else if (typeof element.mozSrcObject !== 'undefined') {
            // current firefox way
            element.mozSrcObject = stream;
            element.play();
        } else if (typeof element.src !== 'undefined') {
            // current chrome way: treat it as default
            var url = URL.createObjectURL(stream);
            element.src = url;
        } else {
            gLogger.log(Grtc.NOT_READY_ERROR + ": setViewFromStream: " +
                "unable to attach stream to the specified element " +
                JSON.stringify(element));
        }
    } else {
        gLogger.log(Grtc.NOT_READY_ERROR + ": setViewFromStream failed");
        throw new Grtc.Error(Grtc.NOT_READY_ERROR, "exception during setViewFromStream");
    }


};

// Export Grtc.Client
Grtc.Client = gClient;

})();

// -------------------- END of Class Grtc.Client --------------------


// -------------------- Class Grtc.MediaSession --------------------

/*
 * The MediaSession class is encapsulated in an anonymous closure and
 * exported as a property of Grtc.
 */
(function () {

var gMediaSession = function (client) {
    this.grtcClient = client;
    this.sessionId = ++Grtc.MediaSession.sessionId;
    this.otherSessionId = null;
    this.sequenceNumber = 0;
    this.actionNeeded = false;
    this.iceStarted = false;
    this.moreIceComing = true;
    this.outCandidates = [ ];
    this.iceCandidateCount = 0;
    this.dataToAttach = null;
    this.dataAttached = null;
    this.offerToReceiveAudioInOffer  = true;
    this.offerToReceiveVideoInOffer  = true;
    this.offerToReceiveAudioInAnswer = true;
    this.offerToReceiveVideoInAnswer = true;
    this.dtmfSender = null;

    this.onRemoteStream = $.Callbacks();

    if (client) {
        client.mediaSession = this;
    }
    var that = this;

    var conf = this.grtcClient.configuration;
    var iceServers = [];
    // add stun server to the list of ice servers if it is available
    if (conf.stun_server) {
        iceServers.push({"url": "stun:" + conf.stun_server});
    }
    // add turn server to the list of ice servers if it is available
    if (conf.turn_server && conf.turn_username && conf.turn_password) {
        // turn config format on chrome changed in M28
        var re = null;
        var chromeVersion = null;
        if (navigator.webkitGetUserMedia) {
            re = /Chrom(e|ium)\/([0-9]+)\./;
            chromeVersion = parseInt(navigator.userAgent.match(re)[2], 10);
        }
        var url = "turn:";
        if (chromeVersion !== null && chromeVersion < 28) {
            // chrome version 27 or lower
            url += (conf.turn_username + "@" + conf.turn_server);
            iceServers.push({"url": url, "credential": conf.turn_password});
        } else {
            // firefox, or chrome version 28 or higher
            url += conf.turn_server;
            iceServers.push({"url": url, "credential": conf.turn_password,
                "username": conf.turn_username});
        }
    }
    gLogger.log("Creating RTCPeerConnnection with configuration: " +
        JSON.stringify(iceServers));
    // create a peer connection - check for DTLS-SRTP config
    // Currently Chrome only allows DtlsSrtpKeyAgreement as an optional constraint for PC
    // Later we may need to change it to mandatory based on Chrome update
    // We set DtlsSrtpKeyAgreement to false by default for now
    var pcConstraints = {"optional": [{"DtlsSrtpKeyAgreement": false}]};
    if (conf.dtls_srtp && conf.dtls_srtp === 'true') {
        pcConstraints = {"optional": [{"DtlsSrtpKeyAgreement": true}]};
    }
    gLogger.log("PeerConnection constraints: " + JSON.stringify(pcConstraints));

    try {
        this.peerConnection = new RTCPeerConnection({"iceServers": iceServers},pcConstraints);
    } catch (e) {
        gLogger.log(Grtc.WEBRTC_NOT_SUPPORTED_ERROR +
            ": construction of RTCPeerConnection object failed", e);
        throw new Grtc.Error(Grtc.WEBRTC_NOT_SUPPORTED_ERROR, e.message);
    }

    // Previously local stream is added when makeCall/acceptCall is invoked
    // Now add local stream as soon as PC is created
    this.peerConnection.addStream(localStream);

    // Create DTMFSender for PC
    try {
        var local_audio_track = localStream.getAudioTracks()[0];
        this.dtmfSender = this.peerConnection.createDTMFSender(local_audio_track);
        gLogger.log("Created DTMF Sender");
    } catch (e) {
        gLogger.log(Grtc.INVALID_STATE_ERROR + ": Failed to Create DTMF Sender",e);
        this.dtmfSender = null;
    }

    // ICE candidates callback
    this.peerConnection.onicecandidate = function (event) {
        if (event.candidate) {
            that.outCandidates.push(event.candidate);
            that.iceCandidateCount += 1;
        } else {
            // NOTE: At the moment, we do not renegotiate when new candidates
            // show up after the more flag has been false once
            gLogger.log("ICEgathering completed");
            if (that.moreIceComing) {
                that.moreIceComing = false;
                that.markActionNeeded();
            }
        }
    };

    // Fired as a result of setRemoteDescription
    this.peerConnection.onaddstream = function (mediaStreamEvent) {
        try {
            gLogger.log("Access to remote stream");
            that.onRemoteStream.fire({ stream: mediaStreamEvent.stream });
        } catch (e) {
            gLogger.log(Grtc.CONNECTION_ERROR + ": onRemoteStream event handling failed", e);
            throw new Grtc.Error(Grtc.CONNECTION_ERROR, e.message);
        }
    };

    this.state = "new";
};

/*
 * Sends one or multiple DTMF tones [0-9],*,#,A,B,C,D
 * tones - string composed by one or multiple valid DTMF symbols
 * options - fields in options object:
 *           duration: default 100ms. The duration cannot be more than 6000 ms or less than 70 ms.
 *           tonegap:  the gap between tones. It must be at least 50 ms. The default value is 50 ms. 
 * We don't check for validity of the options fields, the WebRTC API validates this
 * returns 0 for success, -1 for failure
 */
gMediaSession.prototype.sendDTMF = function(tones, options) {
    if (this.dtmfSender === null) {
        gLogger.log("DTMF Sender is NULL");
        return -1;
    }
    if (tones === null || tones.length === 0) {
        gLogger.log("No DTMF tones specified for sending");
        return -1;
    }
    var duration = 100;
    var tonegap  = 50;
    if (options.tonegap) {
        tonegap = options.tonegap;
    }
    if (options.duration) {
        duration = options.duration;
    }
    try {
        this.dtmfSender.insertDTMF(tones, duration, tonegap);
        gLogger.log("DTMF tones sent - " + tones);
        return 0;
    } catch(e) {
        gLogger.log(Grtc.INVALID_STATE_ERROR + ": DTMF tone sending failed", e);
        return -1;
    }
};

/* Mark the flags so that ICE gathering will start. */
gMediaSession.prototype.startIceGathering = function () {
    if (!this.iceStarted) {
        gLogger.log("ICE candidate gathering starts");
        this.iceStarted = true;
        this.moreIceComing = true;
        this.iceCandidateCount = 0;
    }
    this.markActionNeeded();
};

/* This function processes signalling messages from the other side.
 * @param {string} msgstring JSON-formatted string containing a ROAP message. */
gMediaSession.prototype.processSignalingMessage = function (msgstring) {
    gLogger.log("processSignalingMessage: " + msgstring);
    var startJSON = msgstring.search("{");
    if (startJSON > 0) {
        msgstring = msgstring.substr(startJSON);
    }
    try {
        var msg = JSON.parse(msgstring);
    } catch (e) {
        // MWA-328: received unexpected message, ignore for now
        gLogger.log(Grtc.GRTC_WARN + ": JSON.parse exception ignored: ", e);
        return;
    }

    this.incomingMessage = msg;
    gLogger.log("processSignalingMessage(type=" +
        msg.messageType + ", state=" + this.state + ")");

    // Handle incoming attached data
    if (msg.attacheddata) {
        this.dataAttached = msg.attacheddata;
    }

    if (this.state === "new") {
        if (msg.messageType === "OFFER") {
            // Initial offer
            this.offer_as_string = msg.sdp;
            msg.type = "offer";
            this.peerConnection.setRemoteDescription(
                new RTCSessionDescription(msg), 
                function () {
                    gLogger.log("setRemoteDescription() success");
                }, 
                function (rtcErr) {
                    gLogger.log(Grtc.GRTC_ERROR +
                        ": setRemoteDescription() failed - " + JSON.stringify(rtcErr));
                }
            );

            this.offer_candidates = msg.Candidates;
            this.state = "offer-received";
            this.markActionNeeded(); // Allow other stuff to happen, then reply
        } else {
            gLogger.log(Grtc.CONNECTION_ERROR +
                ": incorrect message type during processSignalingMessage, " +
                "in state " + this.state +
                ", with message type " + msg.messageType);
            throw new Grtc.Error(Grtc.CONNECTION_ERROR, "Illegal message " +
                msg.messageType + " in state " + this.state);
        }
    } else if (this.state === "offer-sent") {
        if (msg.messageType === "ANSWER") {
            msg.type = "answer";
            this.peerConnection.setRemoteDescription(
                new RTCSessionDescription(msg), 
                function () {
                    gLogger.log("setRemoteDescription() success");
                }, 
                function (rtcErr) {
                    gLogger.log(Grtc.GRTC_ERROR +
                        ": setRemoteDescription() failed - " + JSON.stringify(rtcErr));
                }
            );
            this.applyCandidates(msg.Candidates);
            this.sendMessage("OK");
            this.state = "established";
        } else if (msg.messageType === "OFFER") {
            // Glare processing not written yet; do nothing
            gLogger.log("processSignalingMessage(): Glare condition. Offer sent, expecting Answer");
            return;
        } else {
            gLogger.log(Grtc.CONNECTION_ERROR +
                ": incorrect message type during processSignalingMessage, " +
                "in state " + this.state +
                ", with message type " + msg.messageType);
            throw new Grtc.Error(Grtc.CONNECTION_ERROR, "Illegal message " +
                msg.messageType + " in state " + this.state);
        }
    } else if (this.state === "established") {
        if (msg.messageType === "OFFER") {
            this.offer_as_string = msg.sdp;
            msg.type = "offer";
            this.peerConnection.setRemoteDescription(
                new RTCSessionDescription(msg), 
                function () {
                    gLogger.log("setRemoteDescription() success");
                }, 
                function (rtcErr) {
                    gLogger.log(Grtc.GRTC_ERROR +
                        ": setRemoteDescription() failed - " + JSON.stringify(rtcErr));
                }
            );
            this.offer_candidates = msg.Candidates;
            this.state = "offer-received";
            this.markActionNeeded();
        } else if (msg.messageType === "OK") {
            try {
                var remoteStream = this.peerConnection.getRemoteStreams()[0];

                // Notify the client to update the remote stream URL
                gLogger.log("OK msg received: update remote stream");
                this.onRemoteStream.fire({
                    stream: remoteStream
                });

            } catch (e) {
                // Shall not come here; skip otherwise
                gLogger.log(Grtc.GRTC_WARN +
                    ": could not retrieve remote stream, " +
                    "in state " + this.state +
                    ", with message type " + msg.messageType, e);
            }
        } else {
            gLogger.log(Grtc.CONNECTION_ERROR +
                ": incorrect message type during processSignalingMessage, " +
                "in state " + this.state +
                ", with message type " + msg.messageType);
            throw new Grtc.Error(Grtc.CONNECTION_ERROR, "Illegal message " +
                msg.messageType + " in state " + this.state);
        }
    }
};

/* Apply ICE candidates. */
gMediaSession.prototype.applyCandidates = function (Candidates) {
    var count = Candidates.length;
    for (var i = 0; i < count; i++) {
        var candidate = Candidates[i].candidate;
        var label = Candidates[i].sdpMLineIndex;
        var iceCandDict = {sdpMLineIndex:label, candidate:candidate};
        var iceCandidate = new RTCIceCandidate(iceCandDict);
        try {
            gLogger.log("addIceCandidate[" +i + "]: " + JSON.stringify(iceCandidate));
            this.peerConnection.addIceCandidate(iceCandidate);
        } catch (e) {
            // do nothing other than logging
            gLogger.log(Grtc.GRTC_WARN + ": could not add ICE candidate: " +
                JSON.stringify(iceCandidate), e);
        }
    }
};

/* Mark that something happened = do something later (not on this stack). */
gMediaSession.prototype.markActionNeeded = function () {
    this.actionNeeded = true;
    var that = this;
    window.setTimeout( function () { that.onstablestate(); }, 1);
};

/* Called when a stable state is entered by the browser
 * (to allow for multiple AddStream calls or other interesting actions).
 *
 * This function will generate an offer or answer, as needed, and send
 * to the remote party. */
gMediaSession.prototype.onstablestate = function () {
    gLogger.log("onstablestate(state=" + this.state + ")");
    if (this.actionNeeded) {
        this.actionNeeded = false;
        try {
            if (this.state === "new") {
                this.makeOffer();
                this.state = "preparing-offer";
                this.startIceGathering();
            } else if (this.state === "preparing-offer") {
                // Do not do anything until we have the ICE candidates, send the offer
                // we have already prepared otherwise (from this.outSDP/outCandidates)
                if (!this.moreIceComing) {
                    this.sendMessage("OFFER", true);
                    this.state = "offer-sent";
                }
            } else if (this.state === "offer-received") {
                this.makeAnswer();
                this.state = "offer-received-preparing-answer";
                this.startIceGathering();
            } else if (this.state === "offer-received-preparing-answer") {
                if (!this.moreIceComing) {
                    if (this.offer_candidates) {
                        this.applyCandidates(this.offer_candidates);
                        this.offer_candidates = null;
                    }
                    this.sendMessage("ANSWER", true);
                    this.state = "established";
                }
            } else {
                gLogger.log(Grtc.INVALID_STATE_ERROR +
                    ": Unexpected state " + this.state);
                throw new Grtc.Error(Grtc.INVALID_STATE_ERROR, 
                    "Unexpected state " + this.state);
            }
        } catch (e) {
            gLogger.log(Grtc.INVALID_STATE_ERROR + ": onstablestate failed", e);
            throw new Grtc.Error(Grtc.INVALID_STATE_ERROR, "exception during onstablestate");
        }
    }
};

/* Create an offer. */
gMediaSession.prototype.makeOffer = function () {
    var hints = {"mandatory": {
        "OfferToReceiveAudio": this.offerToReceiveAudioInOffer,
        "OfferToReceiveVideo": this.offerToReceiveVideoInOffer
    }};
    var that = this;
    gLogger.log("Sending offer to peer with constraints: " + JSON.stringify(hints));
    this.peerConnection.createOffer(
        function (SDP) {
            that.outSDP = SDP;
            that.peerConnection.setLocalDescription(
                SDP,
                function () {
                    gLogger.log("setLocalDescription() success");
                },
                function (rtcErr) {
                    gLogger.log(Grtc.CONNECTION_ERROR +
                        ": setLocalDescription failed - " + JSON.stringify(rtcErr));
                    throw new Grtc.Error(Grtc.CONNECTION_ERROR,
                        "exception during setLocalDescription");
                }
            );
            if (SDP.sdp.search('a=candidate') !== -1) {
                // ICE gathering done (typical to current Firefox - no trickle ICE)
                gLogger.log("ICEgathering completed while creating offer");
                that.iceStarted = true;
                that.moreIceComing = false;
                that.markActionNeeded();
            }
        },
        function (rtcErr) {
            gLogger.log(Grtc.CONNECTION_ERROR + ": createOffer failed - " +
                JSON.stringify(rtcErr));
            throw new Grtc.Error(Grtc.CONNECTION_ERROR, "exception during createOffer");
        },
        hints
    );
};

/* Make an answer. */
gMediaSession.prototype.makeAnswer = function () {
    var hints = {"mandatory": {
        "OfferToReceiveAudio": this.offerToReceiveAudioInAnswer,
        "OfferToReceiveVideo": this.offerToReceiveVideoInAnswer
    }};
    var that = this;
    gLogger.log("Sending answer to peer with constraints: " + JSON.stringify(hints));
    this.peerConnection.createAnswer(
        function (SDP) {
            that.outSDP = SDP;
            that.peerConnection.setLocalDescription(
                SDP,
                function () {
                    gLogger.log("setLocalDescription() success");
                },
                function (rtcErr) {
                    gLogger.log(Grtc.CONNECTION_ERROR +
                        ": setLocalDescription failed - " + JSON.stringify(rtcErr));
                    throw new Grtc.Error(Grtc.CONNECTION_ERROR,
                        "exception during setLocalDescription");
                }
            );
            if (SDP.sdp.search('a=candidate') !== -1) {
                // ICE gathering done (typical to current Firefox - no trickle ICE)
                gLogger.log("ICEgathering completed while creating offer");
                that.iceStarted = true;
                that.moreIceComing = false;
                that.markActionNeeded();
            }
        },
        function (rtcErr) {
            gLogger.log(Grtc.CONNECTION_ERROR + ": createAnswer failed - " +
                JSON.stringify(rtcErr));
            throw new Grtc.Error(Grtc.CONNECTION_ERROR, "exception during createAnswer");
        },
        hints
    );
};

/* Send a signalling message.
 * @param {string} operation What operation to signal.
 * @param {string} sdp SDP message body. */
gMediaSession.prototype.sendMessage = function (operation, withSDP) {
    var roapMessage = {};
    roapMessage.messageType = operation;
    if (withSDP) {
        roapMessage.sdp = this.outSDP.sdp;
        if (this.outCandidates.length > 0) {                    // In case of Chrome
            roapMessage.Candidates = this.outCandidates;
        } else {                                                // In case of FF
            roapMessage.Candidates = extractIceCandidatesFromSdp(roapMessage.sdp);
        }
    }
    if (operation === "OFFER") {
        roapMessage.offererSessionId = this.sessionId;
        roapMessage.answererSessionId = this.otherSessionId;  // May be null
        roapMessage.seq = ++this.sequenceNumber;
        // The tiebreaker needs to be neither 0 nor 429496725
        roapMessage.tiebreaker = Math.floor(Math.random() * 429496723 + 1);

        // Attach data if available
        if (this.dataToAttach) {
            roapMessage.attacheddata = this.dataToAttach;
        }
    } else {
        roapMessage.offererSessionId = this.incomingMessage.offererSessionId;
        roapMessage.answererSessionId = this.sessionId;
        roapMessage.seq = this.incomingMessage.seq;

        // Attach data if available
        if (this.dataToAttach) {
            roapMessage.attacheddata = this.dataToAttach;
        }
    }
    sendToPeer(this.grtcClient.configuration.webrtc_gateway,
        pcDest, "RSMP " + JSON.stringify(roapMessage));
};

// ============================================================================
// Public interface of MediaSession contains the following:
//   makeCall
//   acceptCall
//   rejeceCall
//   updateCall
//   terminateCall
//   setData
//   getData
// ============================================================================

/* Initiate an audio/video call. */
gMediaSession.prototype.makeCall = function (remoteId,
                                             audioConstraints, videoConstraints) {
    // At this point, user should have authorized local media access,
    // which determines what to send (audio/video). Before making a
    // call, the user can still control what to receive (audio/video),
    // and the constraints will be used in createOffer.
    if (typeof audioConstraints !== "undefined") {
        this.offerToReceiveAudioInOffer = audioConstraints;
    }
    if (typeof videoConstraints !== "undefined") {
        this.offerToReceiveVideoInOffer = videoConstraints;
    }

    pcDest  = remoteId;
    gLogger.log("Adding local stream to PeerConnection");
    callState = CALL_STATE_ONGOING;
    this.markActionNeeded();
};

/* Accept a call from number saved in pcDest. */
gMediaSession.prototype.acceptCall = function (audioConstraints, videoConstraints) {
    // At this point, user should have authorized local media access,
    // which determines what to send (audio/video). Before accepting a
    // call, the user can still control what to receive (audio/video),
    // and the constraints will be used in createAnswer.
    if (typeof audioConstraints !== "undefined") {
        this.offerToReceiveAudioInAnswer = audioConstraints;
    }
    if (typeof videoConstraints !== "undefined") {
        this.offerToReceiveVideoInAnswer = videoConstraints;
    }
    callState = CALL_STATE_ONGOING;
    try {
        this.processSignalingMessage(incomingMsg);
    } catch (e) {
        gLogger.log(Grtc.CONNECTION_ERROR + ": acceptCall failed", e);
        throw new Grtc.Error(Grtc.CONNECTION_ERROR,
            "exception during processSignalingMessage");
    }
};

/* Reject an incoming call. */
gMediaSession.prototype.rejectCall = function () {
    if (pcDest) {
        sendToPeer(this.grtcClient.configuration.webrtc_gateway, pcDest, "BYE");
        pcDest = null;
    }
    callState = CALL_STATE_NOT_STARTED;

    this.state = "closed";
    this.peerConnection.close();

    if (this.grtcClient.mediaSession) {
        this.grtcClient.mediaSession = null;
    }
};

/* Update the call in progress by resetting media streams.
 * Eventually we shall be able to reset the audio/video constraints to any
 * user specified object by calling getUserMedia again. For now, we only
 * support "true" and "false" constraints; and other valus of audioConstraints
 * and videoConstraints will be ignored.
 * TODO: remove the log msg in this method before release. */
gMediaSession.prototype.updateCall = function (audioConstraints, videoConstraints) {
    if (callState === CALL_STATE_ONGOING) {
        gLogger.log("old constraints: " + this.grtcClient.audioConstraints + ", " +
            this.grtcClient.videoConstraints);
        gLogger.log("new constraints: " + audioConstraints + ", " + videoConstraints);
        var i;
        if (typeof(audioConstraints) !== 'undefined' &&
            audioConstraints !== null &&
            audioConstraints !== this.grtcClient.audioConstraints) {
            var audioTrackList;
            if (this.grtcClient.audioConstraints === false && 
                audioConstraints === true) {
                // user wants to enable audio
                audioTrackList = localStream.getAudioTracks();
                if (audioTrackList) {
                  for (i = 0; i < audioTrackList.length; ++i) {
                      gLogger.log("enable audio track: " + audioTrackList[i]);
                      audioTrackList[i].enabled = true;
                  }
                }
                this.grtcClient.audioConstraints = audioConstraints;
            } else if (audioConstraints === false && 
                this.grtcClient.audioConstraints === true) {
                // user wants to disable audio
                audioTrackList = localStream.getAudioTracks();
                if (audioTrackList) {
                  for (i = 0; i < audioTrackList.length; ++i) {
                      gLogger.log("disable audio track: " + audioTrackList[i]);
                      audioTrackList[i].enabled = false;
                  }
                }
                this.grtcClient.audioConstraints = audioConstraints;
            }
        }

        if (typeof(videoConstraints) !== 'undefined' &&
            videoConstraints !== null &&
            videoConstraints !== this.grtcClient.videoConstraints) {
            var videoTrackList;
            if (this.grtcClient.videoConstraints === false && 
                videoConstraints === true) {
                // user wants to enable video
                videoTrackList = localStream.getVideoTracks();
                if (videoTrackList) {
                  for (i = 0; i < videoTrackList.length; ++i) {
                      gLogger.log("enable video track: " + videoTrackList[i]);
                      videoTrackList[i].enabled = true;
                  }
                }
                this.grtcClient.videoConstraints = videoConstraints;
            } else if (videoConstraints === false && 
                this.grtcClient.videoConstraints === true) {
                // user wants to disable video
                videoTrackList = localStream.getVideoTracks();
                if (videoTrackList) {
                  for (i = 0; i < videoTrackList.length; ++i) {
                      gLogger.log("disable video track: " + videoTrackList[i]);
                      videoTrackList[i].enabled = false;
                  }
                }
                this.grtcClient.videoConstraints = videoConstraints;
            }
        }
    } else {
        gLogger.log(Grtc.INVALID_STATE_ERROR + ": no ongoing call to update");
        throw new Grtc.Error(Grtc.INVALID_STATE_ERROR, "No ongoing call to update");
    }
};

/* Terminate a call. */
gMediaSession.prototype.terminateCall = function () {
    sendToPeer(this.grtcClient.configuration.webrtc_gateway, pcDest, "BYE");
    callState = CALL_STATE_NOT_STARTED;
    this.state = "closed";
    this.peerConnection.close();

    if (this.grtcClient.mediaSession) {
        this.grtcClient.mediaSession = null;
    }
};

/* Set a data item to be attached to the OFFER message.
 * data: a JSON array passed in, where each element in the array
 *       is an object that contains two properties: key and value.
 *       Example:
         [
            {
                "key": "Name",
                "value": "Yong"
            },
            {
                "key": "Account",
                "value": "123456789"
            }
         ]
 */
gMediaSession.prototype.setData = function (data) {
    if (data) {
        try {
            // check if the user data is a non-empty array
            if ($.isArray(data) && data.length>0) {
                // check if each element in the array is well formed
                var isWellFormed = true;
                for (var i=0; i<data.length; ++i) {
                    var dataElement = data[i];
                    // each element should be an object
                    // and should contain exactly two properties
                    if (typeof dataElement !== "object" ||
                        Object.keys(dataElement).length !== 2 ||
                        !dataElement.hasOwnProperty("key") ||
                        !dataElement.hasOwnProperty("value")) {
                        isWellFormed = false;
                        break;
                    }
                }
                if (isWellFormed) {
                    this.dataToAttach = data;
                    return;
                }
            }
        } catch (e) {
            // Throw at the end
        }
    }
    gLogger.log(Grtc.GRTC_ERROR + ": data attached is not well-formed");
    throw new Grtc.Error(Grtc.GRTC_ERROR, "Data attached is not well-formed");
};

/* Get the data item received from the OFFER message. */
gMediaSession.prototype.getData = function () {
    return this.dataAttached;
};

// Export Grtc.MediaSession
Grtc.MediaSession = gMediaSession;

}) ();

// Static variable for allocating new session IDs
Grtc.MediaSession.sessionId = 101;

/* Handle a message received from peer. */
function handlePeerMessage(objClient, peer_name, msg) {
    // Note: the BYE message is sent by itself instead of in a JSON
    // object (which is the case for other messages); we might consider
    // making it consistent in the future
    if (msg.search("BYE") === 0) {
        // Other side has hung up
        callState = CALL_STATE_NOT_STARTED;
        if (objClient.mediaSession) {
            objClient.mediaSession.state = "closed";
            objClient.mediaSession.peerConnection.close();
            objClient.mediaSession = null;
        }
        // Notify the client that the peer is closing
        objClient.onPeerClosing.fire();
    } else if (msg.search("INVITE") === 0) {
        if (peer_name) pcDest = peer_name;
        // notify the client to create the media session and make a call
        objClient.onInvite.fire({
            peer: pcDest
        });
    } else {
        if (objClient.mediaSession) {
            try {
                objClient.mediaSession.processSignalingMessage(msg);
            } catch (e) {
                gLogger.log(Grtc.CONNECTION_ERROR +
                    ": handlePeerMessage failed", e);
                throw new Grtc.Error(Grtc.CONNECTION_ERROR,
                    "exception during handlePeerMessage");
            }
        } else {
            // Other side is calling us, startup
            if (peer_name) pcDest = peer_name;

            // Notify client of incoming call, and the client is expected
            // to handle the event by calling acceptCall (which will call
            // acceptIncoming) or rejectCall
            incomingMsg = msg;
            objClient.onIncomingCall.fire({
                peer: pcDest
            });
        }
    }
}

/* Start to poll WebRTC gateway. */
function startHangingGet(objClient) {
    try {
        var queryurl = objClient.configuration.webrtc_gateway + "/wait?id=" + registeredSSID;
        $.get(queryurl, function (data, textStatus, jqXHR) {
            // You can access readyState/status/data via jqXHR
            try {
                if (jqXHR.readyState !== 4 || disconnecting) {
                    return;
                }

                if (jqXHR.status !== 200) {
                    doSignOut(objClient);
                } else {
                    var peer_name = jqXHR.getResponseHeader("Pragma");
                    handlePeerMessage(objClient, peer_name, jqXHR.responseText);
                }

                if (registeredSSID !== -1) {
                    window.setTimeout(function() { startHangingGet(objClient); }, 0);
                }
            } catch (e) {
                throw e;
            }
        })
        .fail(function (jqXHR, textStatus) {
            if (textStatus === "timeout") {
                gLogger.log("Hanging get times out");
                jqXHR.abort();
                if (registeredSSID !== -1) {
                    window.setTimeout(function() { startHangingGet(objClient); }, 0);
                }
            }
        });
    } catch (e) {
        gLogger.log(Grtc.CONNECTION_ERROR + ": startHangingGet failed", e);
        throw new Grtc.Error(Grtc.CONNECTION_ERROR, "exception during startHangingGet");
    }
}

/* Send message to peer. */
function sendToPeer(gateway, peer_id, data) {
    if (registeredSSID !== -1) {
        gLogger.log("sendToPeer(" + peer_id + ", Data: " + data + ")");
        var queryurl = gateway + "/message?from=" + registeredSSID + "&to=" + peer_id;
        var jqhxr = $.post(queryurl, data);
        return jqhxr;
    }
    return null;
}

/* Sign out from WebRTC gateway. */
function doSignOut(objClient) {
    // Cleanup all active connections (if applicable) and then sign out

    var gateway = objClient.configuration.webrtc_gateway;

    if (callState === CALL_STATE_ONGOING) {
        gLogger.log("Signing out. Hanging up ongoing call. Sending BYE to peer: " + pcDest);
        sendToPeer(gateway, pcDest, "BYE");
        callState = CALL_STATE_NOT_STARTED;
        if (objClient.mediaSession) {
            objClient.mediaSession.state = "closed";
            objClient.mediaSession.peerConnection.close();
            objClient.mediaSession = null;
        }
    }

    disconnecting = true;

    if (registeredSSID !== -1) {
        var queryurl = gateway + "/sign_out?id=" + registeredSSID;
        // Currently no specific handling if a sign_out request fails
        // the client will just quit
        $.get(queryurl);
        registeredSSID = -1;
    }

    disconnecting = false;
}

/* In case of FireFox the ICE candidates are in the SDP */
function extractIceCandidatesFromSdp(sdp) {
    var sdpLines = sdp.split('\r\n');
    var sdpMLineIndex = -1;
    var sdpMid = "";
    var candidates = [ ];

    for (var i = 0; i < sdpLines.length; i++) {
        if (sdpLines[i].search('m=audio') !== -1) {
            sdpMLineIndex += 1;
            sdpMid = "audio";
        } else if (sdpLines[i].search('m=video') !== -1) {
            sdpMLineIndex += 1;
            sdpMid = "video";
        } else if (sdpLines[i].search('a=candidate') !== -1) {
            var candidate = {};
            candidate.sdpMLineIndex = sdpMLineIndex;
            candidate.sdpMid = sdpMid;
            candidate.candidate = sdpLines[i]; //+ '\r\n';
            candidates.push(candidate);
        }
    }
    return candidates;
}

// Export Grtc
window.Grtc = Grtc;

})(window, navigator, document, jQuery);
