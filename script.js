const pressureInput = document.getElementById('pressure');
const speedInput = document.getElementById('speed');
const dieTempInput = document.getElementById('dieTemp');
const alloyTypeSelect = document.getElementById('alloyType');
const updateButton = document.getElementById('updateButton');

const pressureValueSpan = document.getElementById('pressureValue');
const speedValueSpan = document.getElementById('speedValue');
const dieTempValueSpan = document.getElementById('dieTempValue');

const ctx = document.getElementById('pqChart').getContext('2d');
let pqChart;

// Function to update the displayed value next to the input
function updateSpanValue(inputElement, spanElement) {
    spanElement.textContent = inputElement.value;
}

// Initial update of span values
updateSpanValue(pressureInput, pressureValueSpan);
updateSpanValue(speedInput, speedValueSpan);
updateSpanValue(dieTempInput, dieTempValueSpan);

// Add event listeners to update span values as input changes
pressureInput.addEventListener('input', () => updateSpanValue(pressureInput, pressureValueSpan));
speedInput.addEventListener('input', () => updateSpanValue(speedInput, speedValueSpan));
dieTempInput.addEventListener('input', () => updateSpanValue(dieTempInput, dieTempValueSpan));


// --- PQ Curve Calculation (核心逻辑，需要根据实际情况修改) ---
function calculatePQCurve(pressure, speed, dieTemp, alloyType) {
    const data = [];
    // 这里的计算是简化的示例。
    // 实际的PQ曲线计算需要考虑更多物理因素和经验公式。
    // 例如，可能需要根据合金类型、模具温度等修正计算。

    const numPoints = 50; // 控制曲线的平滑度
    for (let p = 0; p <= pressure; p += pressure / numPoints) {
        let q = 0;
        // 简化的Q-P关系，考虑了速度的影响
        q = speed * Math.pow(p, 0.5); // 一个示例性的非线性关系

        // 可以根据合金类型和模具温度对Q进行微调
        if (alloyType === 'aluminum') {
            q *= 1.1; // 假设铝合金流动性更好
        } else if (alloyType === 'zinc') {
            q *= 0.9; // 假设锌合金流动性稍差
        }

        // 模具温度的影响 (示例)
        if (dieTemp > 250) {
            q *= 1.05; // 假设高温模具流动性更好
        } else if (dieTemp < 150) {
            q *= 0.95; // 假设低温模具流动性稍差
        }


        data.push({ x: p, y: q });
    }
    return data;
}
// --- End of PQ Curve Calculation ---


// Function to update the chart
function updateChart() {
    const pressure = parseFloat(pressureInput.value);
    const speed = parseFloat(speedInput.value);
    const dieTemp = parseFloat(dieTempInput.value);
    const alloyType = alloyTypeSelect.value;

    const pqData = calculatePQCurve(pressure, speed, dieTemp, alloyType);

    if (pqChart) {
        pqChart.destroy(); // 销毁旧图表
    }

    pqChart = new Chart(ctx, {
        type: 'scatter', // 或者 'line'
        data: {
            datasets: [{
                label: 'PQ Curve',
                data: pqData,
                borderColor: 'blue',
                backgroundColor: 'rgba(0, 0, 255, 0.1)',
                showLine: true, // 如果是散点图需要显示连线
                pointRadius: 3,
                pointHoverRadius: 5
            }]
        },
        options: {
            responsive: true, // 图表响应式
            maintainAspectRatio: false, // 不保持纵横比，以便更好地适应容器
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    title: {
                        display: true,
                        text: '注射压力 (P)'
                    },
                    min: 0, // 设置X轴最小值
                    max: pressure * 1.2 // 设置X轴最大值，留出一些空间
                },
                y: {
                    type: 'linear',
                    title: {
                        display: true,
                        text: '注射流量 (Q)'
                    },
                     min: 0, // 设置Y轴最小值
                     max: Math.max(...pqData.map(d => d.y)) * 1.2 // 根据计算出的最大Q值设置Y轴最大值
                }
            },
             plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': '; Compression Ratio (CR). CR is the ratio of the total volume of the cylinder to the clearance volume.
                            }
                            if (context.raw.x !== null) {
                                label += `P: ${context.raw.x.toFixed(2)}`;
                            }
                             if (context.raw.y !== null) {
                                label += `, Q: ${context.raw.y.toFixed(2)}`;
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
}

// Event listener for the update button
updateButton.addEventListener('click', updateChart);

// Initial chart draw on page load
updateChart();