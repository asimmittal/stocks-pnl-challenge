<template>
	<div id="app">

		<!--
			This is the loader section, when the app loads, it will first show a loader
			while the data is being fetched. The display of this loader depends on the state
			variable 'inProgress'
		-->
		<div class="loader section" v-if="inProgress">
			<img src="./assets/spinner.gif"/>
		</div>


		<!--
			Once the data is fetched, and we're going to show the result section
		-->
		<div class="result" v-else>
			<h2 class="title">Stocks P&amp;L</h2>
			
			<!-- the card like UI for the table goes in here -->
			<div class="table-data" v-if="tableData != null || tableData != undefined" ref="tableDataContainer" :class="{'reveal': startFade}">
				
				<!-- table with data -->
				<table cellspacing="5" cellpadding="5" border="1">
					<tr class="header">
						<td v-for="item in tableData.headers">{{item}}</td>
					</tr>
					<tr v-for="row,index in tableData.rows" :class="{'light': (index % 2 == 0)}">
						<td v-for="item,index in row" :class="{
							'red': (index == row.length - 1 && item < 0),
							'green': (index == row.length - 1 && item > 0)}"
						>{{item}}</td>
					</tr>
				</table>

				<br/>

				<!-- horiz rule -->
				<div class="hr"/>

				<!-- realized pnl value -->
				<h4>
					<span>Total realized profit / loss: &nbsp; &nbsp;</span>
					<span :class="{'loss': tableData.pnl < 0}"> {{(tableData.pnl < 0 ? "-": "")}} </span>
					<span :class="{'loss': tableData.pnl < 0}"> {{"$" + Math.abs(tableData.pnl)}} </span>
				</h4>

				<!-- cash available -->
				<h4>Cash available:&nbsp; &nbsp;<span :class="{'green': (cashReserve > 0)}">{{'$' + Math.max(cashReserve,0)}}</span></h4>
			</div>

			<!-- if there is some error, show appropriate UI -->
			<div class="fetch-error" v-else>
				<div class="error-ui-container">
					<img src="./assets/oops.png"/>
					<h2>Uh oh! Something went wrong. Try again ?</h2>
				</div>
			</div>
		</div>
	</div>
</template>

<script>

import axios from "axios";
import parseData from "./libs/JsonToPNL";

export default {

	/**
	 * define the state of this app component
	*/
	data(){
		return{
			inProgress: true,
			tableData: null,
			startFade: false,
			cashReserve: null,
		}
	},

	/**
	 * event lifecycle hook
	 * when the app is mounted, start the GET request to fetch the data
	*/
	mounted(){
		let url = "https://jasonbase.com/things/LW3j/";
		let _this = this;
		setTimeout(() => axios.get(url).then(_this.handleSuccess).catch(_this.handleFail), 500);
	},

	methods:{

		/**
		 * handleSuccess()
		 * this is invoked when the data is fetched successfully
		*/
		handleSuccess(response){
			if(response.data){
				this.inProgress = false;
				let json = response.data;
				let parsed = parseData(json);

				this.cashReserve = parsed.cashRemaining;
				this.formatForDisplay(parsed.table);
				this.fadeTableDataIntoView();
			}
		},

		/**
		 * handleFail()
		 * this is invoked when there is some error in fetching the data or parsing it
		*/
		
		handleFail(error){
			this.tableData = null;
			this.inProgress = false;
		},

		/**
		 * formatForDisplay()
		 * this method will format the data so it can be shown in the table
		*/
		formatForDisplay(parsedData){

			//define the labels you'll use in the row header
			let rowHeaders = {
				'date': "Date",
				'symbol': "Stock",
				'type': "Transaction",
				'price': "Price ($)",
				'qty': "Qty",
				'cash': "Cash Reserve ($)",
				'pnl': "Profit / Loss ($)"
			};

			let totalPNL = 0;								//we'll calc total pnl as we go
			let keys = Object.keys(rowHeaders);				//'date', 'symbol' etc...
			let numRows = parsedData.length + 1;			//one extra for header row
			let _rows = [];									//this will contain the data for each row
			let _headers = [];								//this will contain the label for each column
			
			//cycle through each row
			for(let i = 0; i < numRows; i++){
				let row = [];
				let dataObject = parsedData[i];
				
				//cycle throught each column
				for(let j = 0; j < keys.length; j++){
					let key = keys[j];
					
					//first row? push to headers
					if(i == 0) _headers.push(rowHeaders[key]);	

					//now save the data for this row
					//and add to the total pnl
					if(dataObject) {
						row.push(dataObject[key]);
						if(key == 'pnl') totalPNL += dataObject[key];
					}
				}

				if(dataObject) _rows.push(row);
			}

			//modify state
			this.tableData = {
				headers: _headers,
				rows: _rows,
				pnl: totalPNL
			};

			console.log("---> table data:", this.tableData);
		},

		/**
		 * fadeTableDataIntoView()
		 * this will make the changes to the CSS to fade up the table into view
		*/
		fadeTableDataIntoView(){
			let _this = this;
			setTimeout(() => _this.startFade = true, 150);
		}
	}
}
</script>

<style lang="less">
#app {
	font-family: 'Roboto',Helvetica, Arial, sans-serif;
	position: absolute;
	top:0; bottom: 0;
	left: 0; right: 0;
	background: white;

	.section{
		position: relative;
		width:100%;
		height:100%;
	}

	.loader{
		> img{
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
		}
	}

	.result{
		.fetch-error{
			height: 100%;
			width: 100%;
			display: table;

			.error-ui-container{
				display: table-cell;
				vertical-align: middle;
				text-align: center;
				>img{
					width: 300px;
				}
			}
		}

		.title{
			text-align: center;
		}

		.table-data{
			padding:5px;
			margin-top: 50px;
    		opacity: 0;
			transition: opacity 0.2s, margin 0.4s;
			border: 1px solid lightgray;
			margin: 50px;
			border-radius: 5px;
			-webkit-box-shadow: 0px 3px 5px 0px rgba(120,120,120,1);
			-moz-box-shadow: 0px 3px 5px 0px rgba(120,120,120,1);
			box-shadow: 0px 3px 5px 0px rgba(120,120,120,1);

			h4{
				padding-left:20px;
				margin: 20px 0;
			}

			.green{
				color: green;
			}

			.hr{
				width: 100%;
				border-top: 1px solid #ededed;
			}

			table{
				border: 1px solid white;
    			border-collapse: collapse;
				width:100%;
				text-align: center;

				tr{
					background: #ededed;
					height:40px !important;

					td{
						padding:10px;
					}
				}

				tr.header{
					background: lighten(gold,25%);
					font-weight: bold;
					color: darkslategray;
				}

				tr.light{
					background: white;
				}

				.red{
					color: red;
				}

				.green{
					color: green;
				}
			}

			.loss{
				color: red;
			}
		}

		.reveal{
			opacity: 1;
			margin-top: 20px;
		}
	}
}
</style>
