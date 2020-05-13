import React from 'react';
import PropTypes from 'prop-types';

import { generateRowSizes, snap, generateSnapValues } from './Helpers';

import DateBlob from './DateBlob';
import MouseEnums from './MouseEnums';

export default class BlobContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      blobs: new Map(),
      MOUSE_EVENT: "",
      tempBlob: {},
      cols: 7 | this.props.cols,
      rows: 8 | this.props.rows
    }
  }

  componentDidMount() {
    this.setState({
      snapValues: generateSnapValues(30)
    })
  }

  deleteBlob = (event) => {
    var { blobs } = this.state;
    blobs.delete(parseInt(event.target.dataset.id))
    this.setState({
      blobs: blobs
    });
  }

  addBlob = () => {

  }

  onMouseDown = (event) => {
    if (event.target.dataset.clickType === "blob-row" || event.target.dataset.clickType === "blob-container") {
      var { blobs } = this.state;
      let start = snap(this.state.snapValues, event.clientY - document.getElementById("DatePickerContent").offsetTop);
      let tempBlob = {
        blobID: Math.round(Math.random() * 10000),
        start: start,
        stop: start,
        column: event.target.dataset.col,
        visible: true,
      };

      blobs.set(tempBlob.blobID, tempBlob);
      // Initialize new blob in state

      this.setState({
        MOUSE_EVENT: MouseEnums.NEW_BLOB,
        blobs: blobs,
        selectedBlobID: tempBlob.blobID
      });
    } else if (event.target.dataset.clickType === "blob") {
      var selectedBlob = this.state.blobs.get(parseInt(event.target.dataset.id))
      var mouseToTopOfBlobOffset = event.clientY - selectedBlob.start;
      var mouseToBottomOfBlobOffset = event.clientY - selectedBlob.stop;

      var boundingBox = event.target.getBoundingClientRect()
      var resize = !(boundingBox.height + boundingBox.top - event.clientY > 4);

      this.setState({
        MOUSE_EVENT: resize ? MouseEnums.RESIZE_BLOB : MouseEnums.MOVE_BLOB,
        mouseToTopOfBlobOffset: mouseToTopOfBlobOffset,
        mouseToBottomOfBlobOffset: mouseToBottomOfBlobOffset,
        selectedBlobID: parseInt(event.target.dataset.id)
      });
    }
    // Determine style of mouse click
  }

  onMouseUp = (event) => {
    var { MOUSE_EVENT } = this.state;
    switch (MOUSE_EVENT) {
      case MouseEnums.RESIZE_BLOB:
        this.setState({
          selectedBlobID: 0,
          MOUSE_EVENT: ""
        });
        break;
      case MouseEnums.MOVE_BLOB:
        this.setState({
          selectedBlobID: 0,
          MOUSE_EVENT: ""
        });
        break;
      case MouseEnums.NEW_BLOB:
        this.setState({
          selectedBlobID: 0,
          MOUSE_EVENT: ""
        });
        break;
        break;
      default:
        break;
    }
    this.props.onChange(Array.from(this.state.blobs.values()))
  }

  onMouseMove = (event) => {
    var { MOUSE_EVENT } = this.state;
    switch (MOUSE_EVENT) {
      case MouseEnums.RESIZE_BLOB:
        var { blobs, selectedBlobID } = this.state;v
        var tempBlob = blobs.get(selectedBlobID);
        tempBlob.stop = snap(this.state.snapValues, (event.clientY - document.getElementById("DatePickerContent").offsetTop));
        blobs.set(selectedBlobID, tempBlob)
        this.setState({
          blobs: blobs
        });
        break;
      case MouseEnums.MOVE_BLOB:
        var {
          mouseToTopOfBlobOffset,
          mouseToBottomOfBlobOffset
        } = this.state;
        var { blobs, selectedBlobID } = this.state;
        var selectedBlob = blobs.get(selectedBlobID)
        var newStart = snap(this.state.snapValues, (event.clientY - mouseToTopOfBlobOffset));
        var newStop = snap(this.state.snapValues, (event.clientY - mouseToBottomOfBlobOffset));
        if (newStart > 0 && newStop < document.getElementById("BlobContainer").getBoundingClientRect().bottom) {

          selectedBlob.start = newStart;
          selectedBlob.stop = newStop;
        }

        blobs.set(selectedBlobID, selectedBlob)
        this.setState({
          blobs: blobs
        });
        break;
      case MouseEnums.NEW_BLOB:
        // Update blob in state
        var { blobs, selectedBlobID } = this.state;
        var blob = blobs.get(selectedBlobID)
        let stop = snap(this.state.snapValues, event.clientY - document.getElementById("DatePickerContent").offsetTop);
        blob.stop = stop;
        blobs.set(selectedBlobID, blob);
        this.setState({
          blobs: blobs
        });
        break;
      default:
        break;
    }
  }


  eventDispatcher = (event) => {
    switch (event.type) {
      case "mousemove":
        this.onMouseMove(event);
        break;
      case "mouseup":
        this.onMouseUp(event);
        break;
      case "mousedown":
        this.onMouseDown(event);
        break;
    }
  }

  events = {
    mouseMove: this.onMouseMove.bind(this),
    mouseUp: this.onMouseUp.bind(this),
    mouseDown: this.onMouseDown.bind(this),
    deleteBlob: this.deleteBlob.bind(this)
  }

  render() {
    var rows = [];
    for (var i = 0; i < this.state.cols; i++) {
      rows.push(<div data-col={i} data-click-type="blob-row">
        {
          Array.from(this.state.blobs.values()).filter(x => parseInt(x.column) === i).map((x, j) => {
            return (<DateBlob key={x.blobID} blob={x} events={this.events} />)
          })
        }
      </div>)
    }
    return <div id="BlobContainer" data-click-type="blob-container" onMouseDown={this.onMouseDown} onMouseMove={this.onMouseMove} onMouseUp={this.onMouseUp} style={{ ...this.props.style, ...generateRowSizes(this.state.cols - 1) }}>
      {rows}
    </div>
  }
}

BlobContainer.propTypes = {
  idGenerator: PropTypes.func,
  snapFunctions: PropTypes.func
}