import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import SettingsIcon from '@material-ui/icons/Settings';
import IconButton from '@material-ui/core/IconButton';
import { withStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';

import * as actions from '../actions';
import requireAuth from './requireAuth';

import ResponsiveGridLayout from './ResponsiveGridLayout';
// import MapWithASearchBox from './Maps/MapWithASearchBox';
import MFPPieChartCals from './MFPPieChartCals';
import MFPCalsLine from './MFPCalsLine';
import ContainerLoader from './ContainerLoader';
import MFPTable from './MFPTable';

const styles = theme => ({
    card: {
        width: '300px',
        margin: '2px',
        textAlign: 'left',
        fontSize: '0px',
    },
    cardHeader: {
        color: 'white'
    },
    root: {
        flexGrow: 1,
    },
    paper: {
        textAlign: 'center',
        color: theme.palette.text.secondary,
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        overflowY: 'auto'
    },
    grid: {
        // alignItems: 'stretch'
    },
    button: {
        // margin: theme.spacing.unit,
    },
    deleteContainer: {

    },
    selectMenu: {
        display: 'none'
    }
});

class MembersArea extends Component {
    constructor(props) {
        super(props);

        this.state = {
            containerHovered: -1,
            deleteOpen: false,
            newContainerOpen: false,
            containers: [],
            select: ''
        };

        this.props.getUserDetails(() => {
            localStorage.setItem('dashboard-layout', this.props.layout)
            this.grid.reloadLayout();
            this.setState({
                containers: [
                    {
                        data:
                            <div>
                                Welcome {this.props.username} to your new fitness dashboard!
                            </div>,
                        key: 'welcomeMessage',
                        minWidth: 2,
                        minHeight: 2,
                        ready: true
                    },
                    {
                        data: null,
                        key: "mfpcals",
                        minWidth: 2,
                        minHeight: 10
                    },
                    {
                        data: null,
                        key: "mfpcals-chart",
                        minWidth: 4,
                        minHeight: 10
                    },
                    {
                        data: null,
                        key: "mfpcals-table",
                        minWidth: 6,
                        minHeight: 8
                    }
                ]
            }, () => {
                this.props.getMFP(() => {
                    this.props.mfp.mfpData.reverse();
                    this.addDataToContainer("mfpcals",
                        <div style={{ display: "flex", flexWrap: "wrap" }}>
                            {this.props.mfp.mfpData.map((day, index) => (
                                <div key={day.date} style={{ border: "2px black solid", padding: "5px", margin: "5px", flexGrow: 1 }}>
                                    <MFPCalsLine
                                        date={index === 0 ? "Today" : new Date(day.date).toDateString()}
                                        actual={day.totals.calories}
                                        goal={day.goals.calories} />
                                </div>)
                            )}
                        </div>
                    )
                    let goals = 0;
                    let totals = 0;
                    for (let i = 0; i < this.props.mfp.mfpData.length; i += 1) {
                        goals += this.props.mfp.mfpData[i].goals.calories;
                        totals += this.props.mfp.mfpData[i].totals.calories;
                    }
                    this.addDataToContainer("mfpcals-chart",
                        <div style={{ height: "100%" }}>
                            <MFPPieChartCals actual={totals} goal={goals} remaining={goals - totals} />
                        </div>
                    )
                    this.addDataToContainer("mfpcals-table",
                        <div style={{ height: "100%" }}>
                            <MFPTable data={[{ id: 0, name: "Frozen yoghurt", calories: 159, fat: 6.0, carbs: 24, protein: 4 }]} />
                        </div>
                    )
                    localStorage.setItem('dashboard-layout', this.props.layout)
                    this.grid.reloadLayout();
                })
            })
        });
    }

    componentDidMount() {
        window.addEventListener('beforeunload', this.saveDetails());
    }

    componentWillUnmount() {
        window.removeEventListener('beforeunload', this.saveDetails());
    }

    addDataToContainer = (key, data) => {
        const { containers } = this.state;
        containers.map(item => {
            if (item.key === key) {
                const newItem = item;
                newItem.data = data;
                newItem.ready = true;
                return newItem;
            }
            return item;
        })
        this.setState({ containers });
    }

    saveDetails = () => {
        this.props.saveDetails(() => {
            console.log('details saved!')
        })
    }

    handleOpenNewContainerSelect = () => {
        this.setState({ newContainerOpen: true });
    }

    handleCloseNewContainerSelect = () => {
        this.setState({ newContainerOpen: false });
    }

    handleAddNewContainer = (e) => {
        const { containers } = this.state;
        if (e.target.value === 1) {
            containers.push({
                data:
                    <div />,
                key: `container-${containers.length}-${Math.random() * 100}`,
                minWidth: 4,
                minHeight: 4
            })
        }
        this.setState({ containers })
    }

    handleClickDelete = (key) => {
        this.setState({ deleteOpen: true, containerToDelete: key })
    }

    handleClickConfirmDelete = () => {
        this.setState({ deleteOpen: false, containerToDelete: null });
        const { containers } = this.state;
        const newContainers = containers.filter(item => item.key !== this.state.containerToDelete);
        this.setState({ containers: newContainers })
    }

    handleClickCancelDelete = () => {
        this.setState({ deleteOpen: false, containerToDelete: null });
    }

    hoverButton = (index) => {
        this.setState({ containerHovered: index === false ? -1 : index });
    }

    render() {
        const { classes } = this.props;
        const { containers, containerHovered } = this.state;
        return (
            <div className={classes.root}>
                <span>
                    <Select
                        IconComponent={() => (
                            <IconButton
                                onClick={this.handleOpenNewContainerSelect}
                                color="primary"
                                className={classes.button}
                            >
                                <AddIcon />
                            </IconButton>
                        )}
                        disableUnderline
                        classes={{ selectMenu: classes.selectMenu }}
                        open={this.state.newContainerOpen}
                        onClose={this.handleCloseNewContainerSelect}
                        onOpen={this.handleOpenNewContainerSelect}
                        onChange={this.handleAddNewContainer}
                        value={this.state.select}
                    >
                        <MenuItem value={1}>Empty container</MenuItem>
                        <MenuItem value={2}>Different container</MenuItem>
                        <MenuItem value={3}>Another different container</MenuItem>
                    </Select>
                    <Dialog
                        open={this.state.deleteOpen}
                        onClose={this.handleClose}
                    >
                        <DialogTitle id="alert-dialog-title">Delete container?</DialogTitle>
                        <DialogContent>
                            <DialogContentText id="alert-dialog-description">
                                Are you sure you want to delete this container?
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={this.handleClickCancelDelete} color="primary">
                                Cancel
                            </Button>
                            <Button onClick={this.handleClickConfirmDelete} color="primary" autoFocus>
                                Delete
                            </Button>
                        </DialogActions>
                    </Dialog>
                    <ResponsiveGridLayout saveDetails={this.props.saveDetails} ref={instance => { this.grid = instance; }}>
                        {containers.map((item, index) => (
                            <div key={item.key} data-grid={{ w: item.minWidth || 2, h: item.minHeight || 2, x: 0, y: 50, minW: item.minWidth || 2, minH: item.minHeight || 2 }}>
                                <Paper square className={classes.paper}>
                                    <div style={{ height: "20px", width: "100%", display: "table" }} onMouseEnter={() => this.hoverButton(index)} onMouseLeave={() => this.hoverButton(false)}>
                                        {containerHovered === index ?
                                            (<span>
                                                <IconButton onClick={() => this.handleClickDelete(item.key)} color="primary" aria-label="delete" className={classes.deleteContainer} disableRipple style={{ height: "auto" }}>
                                                    <DeleteIcon style={{ fontSize: 20 }} />
                                                </IconButton>
                                                <IconButton color="primary" aria-label="settings" className={classes.deleteContainer} disableRipple style={{ height: "auto" }}>
                                                    <SettingsIcon style={{ fontSize: 20 }} />
                                                </IconButton>
                                            </span>)
                                            : (<div />)}
                                    </div>
                                    <ContainerLoader ready={item.ready}>
                                        <div style={{ height: "100%", width: '100%' }}>
                                            {item.data}
                                        </div>
                                    </ContainerLoader>
                                </Paper>
                            </div>
                        ))}
                    </ResponsiveGridLayout>
                </span>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        username: state.auth.username,
        mfp: state.auth.mfp,
        layout: state.auth.layout
    }
}

export default compose(
    requireAuth,
    connect(mapStateToProps, actions),
    // WidthProvider(Responsive),
    withStyles(styles)
)(MembersArea);