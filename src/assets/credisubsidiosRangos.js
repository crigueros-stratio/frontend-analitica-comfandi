
var _SI = "SI"
var _VALUE_WITH_DEFAULT = 'obligacion_con_mora'
var _MESSAGE_WITH_DEFAULT = 'Créditos con mora'
var _MESSAGE_WITHOUT_DEFAULT = 'Créditos sin mora'

//Create the total victims variable for each age range.
var addTotalsToBar = (d, i, columns) => {
    var t = 0;
    for (i = 1; i < columns.length; ++i) {
        t += d[columns[i]] = +d[columns[i]];
    }
    d.total = t;
    return d;
}

var montoscredisubsidio;
var dataStandarized;

async function loadData() {
    montoscredisubsidio = await d3.json('http://10.2.32.68:10083/analitica/montoscredisubsidio_front', addTotalsToBar);
    dataStandarized = standarizeJsonData();
    load();
}
loadData();

function standarizeJsonData() {
    let dataAux = []
    for (let i = 0; i < montoscredisubsidio.length; i++) {
        let findIndex = dataAux.findIndex(element => (element.anio_mora == montoscredisubsidio[i].anio_mora && element.categoria_credisubsidio == montoscredisubsidio[i].categoria_credisubsidio))
        if (findIndex < 0) {
            let jsonAux = {}
            jsonAux.anio_mora = montoscredisubsidio[i].anio_mora
            jsonAux.categoria_credisubsidio = montoscredisubsidio[i].categoria_credisubsidio
            if (montoscredisubsidio[i].obligacion_con_mora == _SI) {
                jsonAux.obligacion_con_mora = 0 + montoscredisubsidio[i].total_creditos
            } else {
                jsonAux.obligacion_sin_mora = 0 + montoscredisubsidio[i].total_creditos
            }
            dataAux.push(jsonAux)
        } else {
            if (montoscredisubsidio[i].obligacion_con_mora == _SI) {
                dataAux[findIndex].obligacion_con_mora = 0 + montoscredisubsidio[i].total_creditos
            } else {
                dataAux[findIndex].obligacion_sin_mora = 0 + montoscredisubsidio[i].total_creditos
            }
        }
    }
    return dataAux
}


function filterByYear(data, year) {
    console.log('')
    return data.filter(d => d.anio_mora == year)
        .map(d => {
            return {
                categoria_credisubsidio: d.categoria_credisubsidio,
                obligacion_sin_mora: d.obligacion_sin_mora,
                obligacion_con_mora: d.obligacion_con_mora
            }
        })
}


function load() {


    console.log('Montos Credito Subsidio:', dataStandarized)


    let svg = d3.select("#svg");

    const margin = { top: 20, right: 20, bottom: 50, left: 40 },
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom;

    let x = d3.scaleBand()
        .range([0, width])
        .padding(0.1)
        .align(0.1);

    let gGravityBar;

    //Color scale for the accident causes
    let colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    let columns,
        numRanges,
        stack,
        layers,
        yGroupMax,
        yStackMax,
        rect, y;

    //Set the default dataset used to be stacked with bars

    //console.log('FilterByYear:',filterByYear(dataStandarized, '2016'))
    setGravityTypeData(filterByYear(dataStandarized, '2016'));
    changeStacked();

    // On change event for the accident gravity combobox.
    d3.select('#gravityType').on("change", () => {
        var sect = document.getElementById("gravityType");
        var section = sect.options[sect.selectedIndex].value;
        //Set the data according to the accident gravity selected
        if (section == "2016") {
            console.log('Recibio 2017')
            setGravityTypeData(filterByYear(dataStandarized, '2016'));
            changeStacked()
        }
        else if (section == "2017") {
            console.log('Recibio 2017')
            setGravityTypeData(filterByYear(dataStandarized, '2017'));
            changeStacked()
        }
        else if (section == "2018") {
            console.log('Recibio 2018')
            setGravityTypeData(filterByYear(dataStandarized, '2018'));
            changeStacked()
        }
        else if (section == "2019") {
            console.log('Recibio 2019')
            setGravityTypeData(filterByYear(dataStandarized, '2019'));
            changeStacked()
        }
         else if (section == "2020") {
             console.log('Recibio 2020')
             setGravityTypeData(filterByYear(dataStandarized, '2020'));
             changeStacked()
         }
        //Set the chart combobox to stacked.
        d3.select("#toggleStacked").property("checked", true)
        //console.log(d3.select("#toggleStacked").property("checked"));
    });

    function changeMode() {
        //Change the chart between modal stacked and grouped
        if (this.value === "grouped") changeGrouped();
        else changeStacked();
    }
    
    //Set the on change event to the radio buttons (Stacked and grouped)
    d3.selectAll("input").on("change", changeMode);



    //Function used to change the chart gravity data depending on user selection
    function setGravityTypeData(data) {

        console.log('Data:', data)

        let keys = Object.getOwnPropertyNames(data[0]).slice(1);
        console.log('Keys:', keys)
        data = data.map(v => {
            v.total = keys.map(key => v[key]).reduce((a, b) => a + b, 0);
            return v;
        });

        data.sort((a, b) => { return b.total - a.total; });

        console.log('Data organizada:', data)

        //Remove the content of the group that encapsulate the chart.
        if (gGravityBar)
            gGravityBar.selectAll("*").remove();

        y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.total)])
            .range([height, 0]);

        //Create the group that encapsulate the chart and transform its location.
        gGravityBar = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        gGravityBar.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(0,0)")
            .call(d3.axisLeft(y)
                .ticks(20)
                .tickSizeInner(20)
                .tickPadding(6)
                .tickSize(0, 0));


        columns = keys

        numRanges = data.length;

        console.log('Número de rangos:', numRanges);

        //Create a stack bar for each accident cause
        stack = d3.stack().keys(columns);

        layers = stack(data).map((layer) => {
            return layer.map((e, i) => {
                return {
                    rango: e.data.categoria_credisubsidio,
                    x: i,//Position at x axis
                    y: e.data[layer.key],//The size of the accident cause at the y axis
                    description: layer.key, //Name of the accident cause
                    total: e.data.total
                }; //The age range total victims.
            });
        });

        console.log('Layers:', layers)

        for (var s = 0; s < numRanges; ++s) {
            var y0 = 0;
            for (var ag = 0; ag < columns.length; ++ag) {
                var e = layers[ag][s];
                e.y0 = y0;
                y0 += e.y;//y0 is the position at wich the accident cause start at y axis
            }
        }

        yGroupMax = d3.max(layers, (layer) => { return d3.max(layer, (d) => { return d.y }); });// The victims cause max value
        yStackMax = d3.max(layers, (layer) => { return d3.max(layer, (d) => { return d.y0 + d.y; }); });//The age range max value

        //The age range x axis scale
        x.domain(data.map((d) => { return d.categoria_credisubsidio; }));
        //The y axis scale size using the max total
        y.domain([0, d3.max(data, (d) => { return d.total; })]).nice();

        //Set the colors domain as the victims cause list
        colorScale.domain(columns);

        gGravityBar.selectAll(".serie")
            .data(layers)
            .enter().append("g")
            .attr("class", "serie")
            .attr("fill", (d) => { return colorScale(d[0].description); })//Set the stack color depending on the victim cause.
            .selectAll("rect")
            .data((d) => { return d; })
            .enter().append("rect")
            .attr("x", (d) => { return x(d.rango); })//The position of the age range at x axis
            .attr("y", height)
            .attr("width", x.bandwidth())
            .attr("height", 0);
        rect = gGravityBar.selectAll("rect");

        //Create the animation for age range stacked bars.
        rect.transition()
            .delay((d, i) => { return i; })
            .attr("y", (d) => { return y(d.y0 + d.y) })
            .attr("height", (d) => { return y(d.y0) - y(d.y0 + d.y) });

        //The message to be shown when the stacked bar has mouse the mouse over.

        rect.append("svg:title")
            .text((d) => {
                var porc = ((d.y * 100) / d.total).toString();
                if (porc.includes(".")) { porc = porc.substring(0, porc.indexOf(".") + 2); }
                return d.rango + ", " + translateLegend(d.description) + ": " + d.y + " - " + porc + "% (total: " + d.total + ")";
            });

        // X-axis set-up.
        gGravityBar.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        //Set the label to the x axis.
        svg.append("text")
            .attr("class", "axis axis--x")
            .attr("text-anchor", "middle")
            .attr("transform", "translate(" + (width / 2) + "," + (height + 60) + ")")
            .text("Categorías");

        //Set the label to the y axis.
        /*
        svg.append("text")
          .attr("class", "axis axis--y")
          .attr("text-anchor", "middle")
          .attr("transform", "translate(-10," + (height / 2) + ")rotate(-90)")
          .attr("dy", "20.0")
          .text("Creditos");
        */

        //Set up the accident cause legend with colors.
        var legend = gGravityBar.selectAll(".legend")
            .data(columns.reverse())//Set the accident cause names.
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", (d, i) => { return "translate(0," + (i * 20) + ")"; });
        legend.append("rect")
            .attr("x", width - 38)
            .attr("width", 18)
            .attr("height", 18)
            .attr("fill", colorScale);
        legend.append("text")
            .attr("x", width - 44)
            .attr("y", 9)
            .attr("dy", ".35em")
            .attr("text-anchor", "end")
            //.text((d) => { return 'Total Créditos'; });
            .text((d) => { return translateLegend(d); });
    };

    //Configure the chart animation to be show as grouped mode.
    function changeGrouped() {
        y.domain([0, yGroupMax]);
        svg.selectAll("g .y.axis")
            .call(d3.axisLeft(y)
                .ticks(20)
                .tickSizeInner(20)
                .tickPadding(6)
                .tickSize(0, 0));

        rect.transition()
            .duration(500)
            .delay((d, i) => { return i; })
            .attr("x", (d) => { return x(d.rango) + 0.5 + columns.indexOf(d.description) * (x.bandwidth() / columns.length); })
            .attr("width", x.bandwidth() / columns.length)
            .transition()
            .attr("y", (d) => { return y(d.y); })
            .attr("height", (d) => { return height - y(d.y); });
    }

    //Configure the chart animation to be show as stacked mode.
    function changeStacked() {
        y.domain([0, yStackMax]);
        svg.selectAll("g .y.axis")
            .call(d3.axisLeft(y)
                .ticks(20)
                .tickSizeInner(20)
                .tickPadding(6)
                .tickSize(0, 0));
        rect.transition()
            .duration(500)
            .delay((d, i) => { return i; })
            .attr("y", (d) => { return y(d.y0 + d.y); })
            .attr("height", (d) => { return y(d.y0) - y(d.y0 + d.y); })
            .transition()
            .attr("x", (d) => { return x(d.rango); })
            .attr("width", x.bandwidth());
    }

    function translateLegend(d) {
        if (d == _VALUE_WITH_DEFAULT)
            return _MESSAGE_WITH_DEFAULT
        else
            return _MESSAGE_WITHOUT_DEFAULT
    }

}
