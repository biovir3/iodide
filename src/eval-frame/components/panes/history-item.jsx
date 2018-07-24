import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import ArrowBack from '@material-ui/icons/ArrowBack'

import ExternalDependencyOutput from '../outputs/external-resource-output'
import OutputRenderer from '../outputs/output-renderer'

import PaneContentButton from './pane-content-button'
// import { prettyDate } from '../../tools/notebook-utils'
import { postMessageToEditor } from '../../port-to-editor'

import { prettyDate, getCellById } from '../../tools/notebook-utils'

export class HistoryItemUnconnected extends React.Component {
  static propTypes = {
    cell: PropTypes.shape({
      content: PropTypes.string,
      display: PropTypes.bool,
      cellID: PropTypes.number,
      lastRan: PropTypes.instanceOf(Date),
    }).isRequired,
  }
  constructor(props) {
    super(props)
    this.state = { timeSince: 'just now' }
    this.showEditorCell = this.showEditorCell.bind(this)
  }

  componentDidMount() {
    setInterval(() => {
      this.setState({ timeSince: prettyDate(this.props.cell.lastRan) })
    }, 5000)
  }

  showEditorCell() {
    postMessageToEditor(
      'CLICK_ON_OUTPUT',
      {
        id: this.props.cell.cellID,
        autoScrollToCell: true,
      },
    )
  }

  render() {
    const id = this.props.cell.cellID
    let cellOutput
    switch (this.props.cellType) {
      case 'code':
      case 'plugin':
        cellOutput = <OutputRenderer cellId={id} />
        break
      case 'external dependencies':
        cellOutput = <ExternalDependencyOutput cellId={id} key={id} />
        break
      case 'css':
        cellOutput = 'page styles updated'
        break
      default:
        // TODO: Use better class for inline error
        cellOutput = <div>Unknown cell type {this.props.cellType}</div>
        break
    }

    const historyMetadata = (
      <div className="history-metadata">
        <div className="history-show-actual-cell">
          <PaneContentButton
            text="scroll to cell"
            onClick={this.showEditorCell}
          >
            <ArrowBack style={{ fontSize: '12px' }} />
          </PaneContentButton>
        </div>
        <div className="history-time-since"> {this.state.timeSince} </div>
        {/* <div className="history-date"> / {this.props.cell.lastRan.toString()}
        </div> */}
      </div>)

    return (
      <div id={`cell-${this.props.cell.cellID}-history`} className="cell history-cell">
        <div className="history-content editor">
          {historyMetadata}
          <pre className="history-item-code">{this.props.content}</pre>
        </div>
        <div className="history-item-output">
          {cellOutput}
        </div>
      </div>
    )
  }
}

export function mapStateToProps(state, ownProps) {
  const { cellType } = getCellById(state.cells, ownProps.cell.cellID)
  return { cellType }
}

export default connect(mapStateToProps)(HistoryItemUnconnected)
