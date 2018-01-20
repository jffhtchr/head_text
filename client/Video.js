import React, { Component } from 'react';
import ReactDOM from 'react-dom';

export default class Video extends Component {
    constructor(props){
    super(props)
    }

    componentDidMount(){
        var lastImageData;
        var canvasSource = document.getElementById("canvas-source")
        // console.log(canvasSource,"^^^^^^^")
        var canvasBlended = document.getElementById("canvas-blended")
        // console.log(canvasBlended, "&&&&&&&")
        var contextSource = canvasSource.getContext('2d');
        // console.log("contextSource", contextSource)
        var contextBlended = canvasBlended.getContext('2d');
        // console.log("contextBlended", contextBlended)

        var video = document.getElementById("video")
        var content = document.getElementById("video-container");
        var canvases = document.getElementsByClassName("canvas")

        // var resize = function () {
        //     var ratio = video.width / video.height;
            

        //     var w = window.innerWidth;
        //     var h = window.innerHeight-110;
        //     // console.log('w', w)
        //     // console.log(window)
    
        //     if (content.width > w) {
        //         content.width = w;
        //         content.height = (w / ratio);
        //     } else {
        //         content.height = h ;
        //         content.width = (h * ratio);
        //     }

        //     canvases.width = content.width ;
        //     canvases.height = content.height;
        //     content.style.left = (w - content.width / 2);
        //     content.style.top = (((h-content.height) / 2) + 55);
        // }

       
        // resize();
    
        // mirror video

	    contextSource.translate(canvasSource.width, 0);
	    contextSource.scale(-1, 1);

        var constraints = {
                audio: false,
                video: { width: 640, height: 480 }
        }

        navigator.mediaDevices.getUserMedia(constraints)
        .then(this.success)
        .catch(this.error);

        window.requestAnimFrame = (function () {
            return window.requestAnimationFrame       ||
                   window.webkitRequestAnimationFrame ||
                   window.mozRequestAnimationFrame    ||
                   window.oRequestAnimationFrame      ||
                   window.msRequestAnimationFrame     ||
                   function (callback) {
                    window.setTimeout(callback, 1000 / 60);
            };
        })();

        

        //updates every 60th of a second
        window.onload = function update(){
            drawVideo();
            blend();
            getCoords();
            checkAreas();
            requestAnimFrame(update);
        }

        //draws video into canvas
        function drawVideo() {
            contextSource.drawImage(video, 0, 0, video.width, video.height);
        }

        //Makes sure the difference is always positive (same as Math.abs)
	    function fastAbs(value) {
		    return (value ^ (value >> 31)) - (value >> 31);
	    }

        //Adjust this to change sensitivity of motion sensors?
	    function threshold(value) {
		    return (value > 0x15) ? 0xFF : 0;
	    }

	    function difference(target, data1, data2) {
		    // blend mode difference
		    if (data1.length != data2.length) return null;
		    var i = 0;
		    while (i < (data1.length * 0.25)) {
			    target[4 * i] = data1[4 * i] == 0 ? 0 : fastAbs(data1[4 * i] - data2[4 * i]);
			    target[4 * i + 1] = data1[4 * i + 1] == 0 ? 0 : fastAbs(data1[4 * i + 1] - data2[4 * i + 1]);
			    target[4 * i + 2] = data1[4 * i + 2] == 0 ? 0 : fastAbs(data1[4 * i + 2] - data2[4 * i + 2]);
			    target[4 * i + 3] = 0xFF;
			    ++i;
		    }
	    }

        function differenceAccuracy(target, data1, data2) {
            if (data1.length != data2.length) return null;
            var i = 0;
            while (i < (data1.length * 0.25)) {
                var average1 = (data1[4 * i] + data1[4 * i + 1] + data1[4 * i + 2]) / 3;
                var average2 = (data2[4 * i] + data2[4 * i + 1] + data2[4 * i + 2]) / 3;
                var diff = threshold(fastAbs(average1 - average2));
                target[4 * i] = diff;
                target[4 * i + 1] = diff;
                target[4 * i + 2] = diff;
                target[4 * i + 3] = 0xFF;
                ++i;
            }
        }
    
        function blend() {
            var width = canvasSource.width;
            var height = canvasSource.height;
            // get webcam image data
            var sourceData = contextSource.getImageData(0, 0, width, height);
            // create an image if the previous image doesn’t exist
            if (!lastImageData) lastImageData = contextSource.getImageData(0, 0, width, height);
            // create a ImageData instance to receive the blended result
            var blendedData = contextSource.createImageData(width, height);
            // blend the 2 images
            differenceAccuracy(blendedData.data, sourceData.data, lastImageData.data);
            // draw the result in a canvas
            contextBlended.putImageData(blendedData, 0, 0);
            // store the current webcam image
            lastImageData = sourceData;
        }

        var spotzzz = []

        function getCoords(){
            var children = document.getElementById("hot-spots").children
            var hotspots = Array.prototype.slice.call( children )
            hotspots.forEach(function(el, i){
                var ratio = document.getElementById("canvas-highlights").width/ video.width;
                spotzzz[i] = {
                            x:      el.offsetLeft / ratio,
                            y:      el.offsetTop / ratio,
                            width:  el.scrollWidth / ratio,
                            height: el.scrollHeight / ratio,
                            el:     el
                        };
            });
            // console.log(spotzzz)
            // $('#hotSpots').children().each(function (i, el) {
            //     var ratio = $("#canvas-highlights").width() / $('video').width();
            //     console.log("i:", i)
            //     console.log('el:', el)
            //     hotSpots[i] = {
            //         x:      this.offsetLeft / ratio,
            //         y:      this.offsetTop / ratio,
            //         width:  this.scrollWidth / ratio,
            //         height: this.scrollHeight / ratio,
            //         el:     el
            //     };
            // });
        }

        function checkAreas() {
            var topBox = document.getElementById('top-box').getBoundingClientRect();
            var leftBox = document.getElementById('left-box').getBoundingClientRect();;
            var rightBox = document.getElementById('right-box').getBoundingClientRect();
    
            var hotSpots = [
                {
                    el:  document.getElementById('left-box'),
                    x:  leftBox.x,
                    y: leftBox.y,
                    width: leftBox.width,
                    height: leftBox.height
                },
                {
                    el: document.getElementById('top-box'),
                    x:  topBox.x,
                    y: topBox.y,
                    width: topBox.width,
                    height: topBox.height
                },
                {
                    el:  document.getElementById('right-box'),
                    x:  rightBox.x,
                    y: rightBox.y,
                    width: rightBox.width,
                    height: rightBox.height
                }
            ]

            // console.log("*&*&*&*&*&", hotSpots)
            // loop over the note area
            var data;
            // for (var r=0; r<hotSpots.length; ++r) {
            //     // var blendedData = contextBlended.getImageData(1/1*r*video.width, 0, video.width, 100);
            //     var blendedData = contextBlended.getImageData(hotSpots[r].x, hotSpots[r].y, hotSpots[r].width, hotSpots[r].height);
            //     // console.log("blendedData: ", blendedData)
            //     var i = 0;
            //     var average = 0;
            //     // loop over the pixels
            //     while (i < (blendedData.data.length * 0.25)) {
            //         // make an average between the color channel
            //         average += (blendedData.data[i*4] + blendedData.data[i*4+1] + blendedData.data[i*4+2]) / 3;
            //         ++i;
            //     }
            //     // calculate an average between of the color values of the note area
            //     average = Math.round(average / (blendedData.data.length * 0.25));
            //     if (average > 10) {
            //         data = {confidence: average, spot: hotSpots[r]};
            //         // makeRed()
            //         // console.log("data", data)
            //         // if(data.spot.el.indexOf(hotSpots)){
            //             // console.log('HELLO')
            //             // document.getElementById("left-box").style.backgroundColor = "red";
            //         // }
            //     }
            // }


            for (var r=0; r<spotzzz.length; ++r) {
                // var blendedData = contextBlended.getImageData(1/1*r*video.width, 0, video.width, 100);
                var blendedData = contextBlended.getImageData(spotzzz[r].x, spotzzz[r].y, spotzzz[r].width, spotzzz[r].height);
                // console.log("blendedData: ", blendedData)
                var i = 0;
                var average = 0;
                // loop over the pixels
                while (i < (blendedData.data.length * 0.25)) {
                    // make an average between the color channel
                    average += (blendedData.data[i*4] + blendedData.data[i*4+1] + blendedData.data[i*4+2]) / 3;
                    ++i;
                }
                // calculate an average between of the color values of the note area
                average = Math.round(average / (blendedData.data.length * 0.25));
                if (average > 10) {
                    data = {confidence: average, spot: spotzzz[r]};
                    // makeRed()
                    // console.log("data", data)
                    // if(data.spot.el.indexOf(hotSpots)){
                        console.log('HELLO')
                        // document.getElementById("left-box").style.backgroundColor = "red";
                    // }
                }
            }
        }
        // function makeRed(){
        //     document.getElementById("left-box").style.backgroundColor = "red";
        // }

    }
   

    // ---------------- METHODS --------------- //
    success(stream) {
        var video = document.getElementById('video');
        video.srcObject = stream;
    }

    error(error) {
        console.log(error);
    }

    render() {

    return (
 
    <div id="video-container">
        
        <video id="video" width="640" height="480" autoPlay></video>

        <canvas className="canvas" id="canvas-source" width="640" height="480"></canvas>
        <canvas className="canvas" id="canvas-highlights" width="640" height="480"></canvas>
        <canvas className="canvas" id="canvas-blended" width="640" height="480"></canvas>

        <div id='hot-spots'>
            <div id="left-box"></div>
            <div id="top-box"></div>
            <div id="right-box"></div>
        </div>
        
    </div>

    );
    }
}






