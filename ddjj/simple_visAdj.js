/********************************************************
*                                                       *
*   dj.js example using Yelp Kaggle Test Dataset        *
*   Eamonn O'Loughlin 9th May 2013                      *
*                                                       *
********************************************************/
 
/********************************************************
*                                                       *
*   Step0: Load data from json file                     *
*                                                       *
********************************************************/
d3.csv("data/adjudicaciones.csv", function (datosGraduados) {
     
    var dateFormat = d3.time.format('%d/%m/%Y');
    var numberFormat = d3.format('.2f');

    datosGraduados.forEach(function (d) {
          d.fecha_acto = dateFormat.parse(d.fecha_acto);

    
     });
/********************************************************
*                                                       *
*   Step1: Create the dc.js chart objects & ling to div *
*                                                       *
********************************************************/
var bubbleChart = dc.bubbleChart("#dc-bubble-graph");
var pieChart = dc.pieChart("#dc-pie-graph");
var pieChartGraduados = dc.pieChart("#dc-pie-graph-grad");
var volumeChartEdades = dc.barChart("#dc-edades-barras");
var lineChart = dc.lineChart("#dc-line-chart");
var dataTable = dc.dataTable("#dc-table-graph");
var rowChart = dc.rowChart("#dc-row-graph");
 
/********************************************************
*                                                       *
*   Step2:  Run data through crossfilter                *
*                                                       *
********************************************************/
var ndx = crossfilter(datosGraduados);

 
 var dateDimension = ndx.dimension(function (d) {
        return d.isodatetime_fecha_acto;
    });
   var dateDimensionGroup = dateDimension.group(); 
   
var monthDimension = ndx.dimension(function (d) {
        return d.proc_ejercicio;
    });

    var monthDimensionGroup = monthDimension.group();


 var sectorPertenece = ndx.dimension(function (d) {
        return d.rubro_contratacion_desc;
    });

    var sectorPerteneceGroup = sectorPertenece.group();



/********************************************************
*                                                       *
*   Step3:  Create Dimension that we'll need            *
*                                                       *
********************************************************/
 
    // for volumechart
    var cityDimension = ndx.dimension(function (d) { return d.uoc_int_desc; });
    var cityGroup = cityDimension.group();
    var cityDimensionGroup = cityDimension.group().reduce();
    
 
    // for pieChart
    var startValue = ndx.dimension(function (d) {
        return d.proc_ejercicio;
    });

    var startValueGroup = startValue.group();


    // for edadChart
    var startValueEdad = ndx.dimension(function (d) {
        return d.fecha_acto;

    });

    var startValueEdadGroup = startValueEdad.group();
 
    // For datatable
    var businessDimension = ndx.dimension(function (d) { return d.uoc_desc; });
/********************************************************
*                                                       *
*   Step4: Create the Visualisations                    *
*                                                       *
********************************************************/
     
 bubbleChart.width(650)
            .height(300)
            .dimension(dateDimension)
            .group(sectorPerteneceGroup)
            .transitionDuration(1500)
            /*.colors(["#a60000","#ff0000", "#ff4040","#ff7373","#67e667","#39e639","#00cc00"])
            .colorDomain([-12000, 12000])*/
         
            .x(d3.scale.linear())
            .y(d3.scale.linear())
            .r(d3.scale.linear())
            .keyAccessor(function (p) {
                return p.fecha_acto;
            })
            .valueAccessor(function (p) {
                return p.proc_ejercicio;
            })
            .radiusValueAccessor(function (p) {
                return p.monto_adjudicacion;
            })
            .transitionDuration(1500)
             .elasticY(true)
             .elasticX(true)
            .yAxisPadding(1)
            .xAxisPadding(1)
            .label(function (p) {
                return p.key;
                })
            .renderLabel(true)
            .renderlet(function (chart) {
                rowChart.filter(chart.filter());
            })
            .on("postRedraw", function (chart) {
                dc.events.trigger(function () {
                    rowChart.filter(chart.filter());
                });
                        });
            ;
 
 
pieChart.width(200)
        .height(200)
        .transitionDuration(1500)
        .dimension(startValue)
        .group(startValueGroup)
        .radius(90)
        .colors(["#FF9B9B","#9BC2FF"])
        // .colorDomain(["M", "F"])
        .minAngleForLabel(0)
        .label(function(d) { return d.data.key; })
        .on("filtered", function (chart) {
            dc.events.trigger(function () {
                volumeChartEdades.filterAll();
            });
        });


pieChartGraduados.width(200)
        .height(200)
        .transitionDuration(1500)
        .dimension(sectorPertenece)
        .group(sectorPerteneceGroup)
        .radius(90)
        .colors(["rgb(255, 50, 0)","rgb(255, 150, 0)","rgb(255, 200, 0)"])
        // .colorDomain(["M", "F"])
        .minAngleForLabel(0)
        .label(function(d) { return d.data.key; })
        .on("filtered", function (chart) {
            dc.events.trigger(function () {
                volumeChartEdades.filterAll();
            });
        });
        
 
volumeChartEdades.width(650)
            .height(200)
            .dimension(startValueEdad)
            .group(startValueEdadGroup)
            .transitionDuration(1500)
            .centerBar(true)    
            .gap(1)
            .x(d3.scale.linear().domain([2010, 2016]))
            .elasticY(true)
            .on("filtered", function (chart) {
                dc.events.trigger(function () {
                    lineChart.filterAll()
                });
            })
            .xAxis().tickFormat(function(v) {return v;});   
 
 
lineChart.width(620)
        .height(200)
        .dimension(dateDimension)
        .group(dateDimensionGroup)
        .x(d3.scale.linear().domain([0, 10000000]))
         .valueAccessor(function(d) {
            return d.value;
             })
        .renderHorizontalGridLines(true)
        .elasticY(true)
            .xAxis().tickFormat(function(v) {return v;});   
 
rowChart.width(440)
            .height(850)
            .dimension(cityDimension)
            .group(cityGroup)
            .renderLabel(false)
            .colors(["#FF4D4D"])
            .colorDomain([0, 10])
            .renderlet(function (chart) {
                volumeChartEdades.filter(chart.filter());
            })
            .on("filtered", function (chart) {
                dc.events.trigger(function () {
                    volumeChartEdades.filter(chart.filter());
                });
                        });
 
 
dataTable.width(800).height(800)
    .dimension(businessDimension)
    .group(function(d) { return "Todos"
     })
    .size(100)
    .columns([
        function(d) { return d.uoc_desc; },
        function(d) { return d.uoc_int_desc; },
        function(d) { return d.monto_adjudicacion; },
      
    ])
    .sortBy(function(d){ return d.monto_adjudicacion; })
    // (optional) sort order, :default ascending
    .order(d3.descending);
/********************************************************
*                                                       *
*   Step6:  Render the Charts                           *
*                                                       *
********************************************************/
             
    dc.renderAll();
});