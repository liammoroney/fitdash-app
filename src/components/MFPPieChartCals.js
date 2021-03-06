import React, { Component } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const COLORS = ['#2ecc71', '#e74c3c'];

class MFPPieChartCals extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            data: [{ name: 'Calories', value: this.props.actual }, { name: 'Calorie Goal', value: this.props.remaining }]
        }
    }

    regenData = () => {
        setTimeout(() => {
            const newData = this.state.data.map((i) => ({ name: i.name, value: Math.abs(i.value + (Math.random() - 0.5) * 500) }))  // eslint-disable-line react/no-access-state-in-setstate
            this.setState({
                data: newData
            })
            this.regenData();
        }, 2000)
    }

    render() {
        const data = this.props.mfp || this.state.data;
        const inner = 80;
        const outer = 100;
        return (
            <ResponsiveContainer width="100%" height="100%">
                <PieChart onMouseEnter={this.onPieEnter}>
                    <Pie
                        data={data}
                        // cx={120}
                        // cy={200}
                        innerRadius={inner}
                        outerRadius={outer}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        label
                    >
                        {
                            data.map((entry, index) => <Cell key={COLORS[index % COLORS.length]} fill={COLORS[index % COLORS.length]} />)
                        }
                    </Pie>
                    <p>
                        Calories: {data[0].value}
                    </p>
                </PieChart>
            </ResponsiveContainer>
        )
    }
}

export default MFPPieChartCals;