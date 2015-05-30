'use strict';

angular.module('nerdproxyApp')
  .factory('Tank', function (BoardInfo, Model) {

    function Tank(modelData) {

      Model.call(this, modelData);

      this.id = Number(modelData.id);
      this.xCm = Number(modelData.xCm);
      this.yCm = Number(modelData.yCm);
      this.colour = modelData.colour || 'green';
      this.rotation = Number(modelData.rotation);
    }

    Tank.prototype = Object.create(Model.prototype);

    _.extend(Tank.prototype, {

      constructor: Tank,

      w: 8,
      h: 12,

      createSnap: function (gameSnap) {

        var snap = gameSnap.group();

        snap.attr('transform', 'translate(' + this.xCm + ', ' + this.yCm + ')');
        snap.addClass('model tank');
        snap.attr('data-model-id', this.id);

        var rect = snap.rect( -(this.w / 2), -(this.h / 2), this.w, this.h, 0.5);
        rect.attr('transform', 'rotate(' + this.rotation + ')');
        rect.attr('fill', this.colour);

        this.snap = snap;
      },

      setPos: function (xCm, yCm) {

        this.xCm = xCm;
        this.yCm = yCm;

        this.snap.attr('x', xCm);
        this.snap.attr('y', yCm);
        this.snap.attr('transform', 'translate(' + xCm + ' ' + yCm + ')');

      },

      startMove: function (xPx, yPx) {
        var ghostSnap = this.snap.clone();
        ghostSnap.addClass('move-shadow');

        this.moveInProgress = {
          ghostSnap: ghostSnap,
          startXPx: xPx,
          startYPx: yPx
        }
      },

      continueMove: function (xPx, yPx) {

        var move = this.moveInProgress;

        var changeXPx = move.startXPx - xPx;
        var changeYPx = move.startYPx - yPx;

        var newXCm = this.xCm - BoardInfo.pxToCm(changeXPx);
        var newYCm = this.yCm - BoardInfo.pxToCm(changeYPx);

        var maxEdgeDist = {
          left: 0,
          right: this.w,
          top: 0,
          bottom: this.h
        };

        newXCm = Math.max(newXCm, maxEdgeDist.left);
        newXCm = Math.min(newXCm, BoardInfo.widthCm - maxEdgeDist.right);

        newYCm = Math.max(newYCm, maxEdgeDist.top);
        newYCm = Math.min(newYCm, BoardInfo.heightCm -maxEdgeDist.bottom);

        this.moveInProgress.hasMoved = true;
        this.moveInProgress.lastXCm = newXCm;
        this.moveInProgress.lastYCm = newYCm;

        move.ghostSnap.attr('transform', 'translate(' + newXCm + ', ' + newYCm + ')');

      },

      endMove: function () {

        if(this.moveInProgress.hasMoved) {
          this.setPos(this.moveInProgress.lastXCm, this.moveInProgress.lastYCm);
        }

        this.moveInProgress.ghostSnap.remove();
        this.moveInProgress = undefined;
      },

      startRotation: function () {
        var ghostSnap = this.snap.clone();
        ghostSnap.addClass('move-shadow');

        this.rotationInProgress = {
          ghostSnap: ghostSnap,
          startRotation: this.rotation
        }
      },

      continueRotation: function (rotationChange) {

        this.rotationInProgress.hasRotated = true;
        this.rotationInProgress.newRotation = this.rotation + rotationChange;
        this.rotationInProgress.ghostSnap.select('rect').attr('transform', 'rotate(' + this.rotationInProgress.newRotation + ')');

      },

      endRotation: function () {
        this.rotationInProgress.ghostSnap.remove();

        if(this.rotationInProgress.hasRotated) {
          this.rotation = this.rotationInProgress.newRotation;
          this.snap.select('rect').attr('transform', 'rotate(' + this.rotation + ')');
        }

        this.rotationInProgress = undefined;
      },

      getContextMenuItems: function() {
        return Model.prototype.getContextMenuItems.call(this).concat([
          'rotate'
        ]);
      },

      setColourLocal: function(colourHex) {
        this.colour = colourHex;
        this.snap.select('rect').attr('fill', colourHex);
      },

      getSyncData: function () {
        return {
          id: this.id,
          xCm: this.xCm,
          yCm: this.yCm,
          rotation: this.rotation,
          type: 'tank',
          colour: this.colour
        }
      }

    });

    return (Tank);

  }
);