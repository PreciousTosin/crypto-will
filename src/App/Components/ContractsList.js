import React, { Component } from "react";
import { Link, NavLink } from "react-router-dom";
import PropTypes from "prop-types";
import ErrorBoundary from "./ErrorBoundary";

import { web3Scripts } from '../../Scripts';

import Card from 'antd/lib/card';
import Col from 'antd/lib/col';
import Divider from 'antd/lib/divider';
import Icon from 'antd/lib/icon';
import Layout from 'antd/lib/layout';
import notification from 'antd/lib/notification';
import Row from 'antd/lib/row';

import 'antd/lib/card/style';
import 'antd/lib/col/style';
import 'antd/lib/divider/style';
import 'antd/lib/icon/style';
import 'antd/lib/layout/style';
import 'antd/lib/notification/style';
import 'antd/lib/row/style';

import { Explorers } from "../../Config";

class ContractsList extends Component {
    state = {
        activeAccount: '',
        foundContracts: [],
        fetchingContracts: false,
        runningSubscription: null
    }

    constructor (props) {
        super(props);
        this.fetchDeployedContracts = this.fetchDeployedContracts.bind(this);
        this.accountUpdated = this.accountUpdated.bind(this);

        this.props.accountUpdated(this.accountUpdated);
        this.props.networkUpdated(this.fetchDeployedContracts);
        this.accountUpdated();
    }

    get fetchingContracts () {
        return !!this.state.runningSubscription;
    }

    accountUpdated () {
        if (!this._mounted) {
            return;
        }
        this.setState({ activeAccount: this.props.selectedAccount }, () => {
            this.fetchDeployedContracts();
        });
    }

    accountLoaded () {
        return this.state.activeAccount === this.props.selectedAccount;
    }

    contractReady () {
        return !!this.props.DeployerContract;
    }

    accountReady () {
        return !!this.props.selectedAccount;
    }

    async fetchDeployedContracts (force = false) {
        if (!this._mounted || !this.accountReady() || !this.contractReady() || (!force && (this.fetchingContracts && this.accountLoaded()))) {
            return ;
        }
        if (this.state.runningSubscription) {
            web3Scripts.stopSubscription(this.state.runningSubscription);
        }
        this.setState({ fetchingContracts: true });
        try {
            const fetchSubscription = web3Scripts.fetchDeployments(this.props.DeployerContract, this.props.networkId, this.state.activeAccount, {
                onData: (event) => {
                    console.log(event)
                    this.state.foundContracts.push(event);
                    this.forceUpdate();
                },
                onChanged: (event) => console.log('Changed', event)
            });

            this.setState({
                runningSubscription: fetchSubscription
            });
            await fetchSubscription;
            this.setState({ fetchingContracts: false });
        } catch (e) {
            notification['error']({
                message: 'Contract List failed to load',
                description: e.message || e
            });
        }
    }

    componentDidMount () {
        this._mounted = true;
        this.fetchDeployedContracts();
    }
  
    componentWillUnmount () {
      this._mounted = false;
    }
    
    render () {
        return (
            <div>
                <Row gutter={0} style={{ margin: '0 0 24px' }}>
                    <Col span={20}>
                        <h2>Contracts List</h2>
                        <Divider style={{ height: '1px', margin: '0' }} />
                    </Col>
                    <Col span={4}>
                        <Row gutter={0} justify='center'>
                            <Col span={11} >
                                <NavLink to='/' title='New contract' >
                                    <Icon type='plus-square' style={{ fontSize: '28px' }} />
                                </NavLink>
                            </Col>
                            <Col span={11} >
                                <h3>: { this.state.fetchingContracts ? '...' : this.state.foundContracts.length }</h3>
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <div>
                    {this.state.foundContracts.map( (contract, index) => {
                        return (
                            <div key={index}>
                                <Card
                                    title={
                                        <NavLink to={`/contract/${ contract.returnValues.contractAddress }`} >
                                            { `${index+1}: ${ contract.returnValues.contractAddress }` }
                                        </NavLink>}
                                    style={{ background: 'transparent' }}
                                    headStyle={{ background: '#dedede' }}
                                    extra={
                                        <Link title='Block Explorer' to={ Explorers[this.props.networkId] ? `${Explorers[this.props.networkId]}address/${contract.returnValues.contractAddress}` : '' }>
                                            <Icon type='cluster' style={{ fontSize: '24px' }}/>
                                        </Link>}
                                >
                                    <div>
                                        <Row>
                                            <Col span={5}>
                                                <h4>Type:</h4>
                                            </Col>
                                            <Col span={19} className='word-wrapped'>{ contract.returnValues.contractType }</Col>
                                        </Row>
                                    </div>
                                    <div>
                                        <Row>
                                            <Col span={5}>
                                                <h4>Transaction:</h4>
                                            </Col>
                                            <Col span={19} className='word-wrapped'>{ contract.transactionHash }</Col>
                                        </Row>
                                    </div>
                                    { JSON.stringify(contract)}
                                </Card>
                            </div>
                        );
                    })}
                </div>
                
            </div>
        );
    }
}

ContractsList.propTypes = {
    selectedAccount: PropTypes.string,
    DeployerContract: PropTypes.object,
    accountUpdated: PropTypes.func,
    networkUpdated: PropTypes.func
}

export default ErrorBoundary(ContractsList);