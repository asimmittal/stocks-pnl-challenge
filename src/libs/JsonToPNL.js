/**
 * Notes on approach:
 * -------------------
 * - For every symbol, we'll first create a PriceQueue
 * - As we cycle through the transactions, we'll do one of the following things based on transaction type

 * ----- if the transaction is a "Buy" of say N units @ X price,
 * ------------ we will inject N blocks (each with value X) into our queue for this symbol
 * ------------ we will recompute our cash. since we're buying, cash available will go down
 
 * ----- if the transaction is a "Sell" of say M units @ Y price
 * ------------ well will pull out M units from the queue for this symbol
 * ------------ since, we're selling, we'll now calculate profit / loss for this transaction
 * ------------ basically = (M * Y) - (M * whatever the initial buy price was)
 * ------------ we will also recompute cash. Since we're selling cashs will go up
 
 * For every transaction, we'll create an entry in our table. Sell entries will have a P/L value
 * Eventually the function 'parse()' will return a JSON object representing all the entries in our table
*/

let PriceQueue = require("./PriceQueue");

function parse(json){
	
	//first derive the different symbol types
	let base = json.base;
	let cash = base.Cash;
	let holdings = base.Holdings;
	let symbols = Object.keys(holdings);
	let transactions = json.transactions;
	
	//now let's create our queues for each symbol
	let qMap = {};
	
	for(let i in symbols){
		let sym = symbols[i];
		qMap[sym] = new PriceQueue(sym);
		qMap[sym].toString();
	}
	
	let _table = [];
	let _cashRemaining = 0;
	
	//now that we have our queues, let's start crunching the transactions
	for(let i in transactions){
		
		//pick a transaction
		let tx = transactions[i];
		
		//check if the symbol for this transaction exists
		if(qMap[tx.symbol]){
			let q = qMap[tx.symbol];			//this is the q for this symbol
			let tableEntry = {};				//let's create an object that represents the entry in the final table for this transaction
			
			//if it does, do this
			switch(tx.type.trim().toLowerCase()){
					
				//for buy transactions
				case 'buy':
					q.insertN(tx.price, tx.amount);								//insert N blocks @ the buy price into the Q
					let cashDelta = -1 * (tx.price * tx.amount);				//calculate total money being spent to buy
					cash += cashDelta;											//recompute available cash
					tableEntry.pnl = null;
					break;
				
				//for sell transactions
				case 'sell':
					let unitsToSell = tx.amount;								//how many units are we selling?
					let unitsAvailable = q.length();							//how many units are available in our Q?
					
					//if we have enough for this transaction to be valid, do this
					if(unitsAvailable >= unitsToSell){
						let blocks = q.removeN(unitsToSell);									//remove as many blocks from our queue as we have sold in this transaction
						let buyPrice = blocks.reduce((acc, val) =>  {return (acc + val)} );		//add those blocks up. This is the total buying price for N blocks
						let sellPrice = tx.price;												//this is the selling price per unit
						let pnl = (unitsToSell*sellPrice) - buyPrice;							//compute pnl for this transaction
						let cashDelta = (tx.price * tx.amount);									//calc change in cash after transaction is done
						cash += cashDelta;														//recompute the value of cash
						
						tableEntry.pnl = pnl;
					}
					else throw "Illegal transaction. Not enough units to sell";
					break;
			}
			
			tableEntry.cash = cash;
			tableEntry.symbol = tx.symbol;
			tableEntry.date = tx.date;
			tableEntry.type = (tx.type.trim().toLowerCase() == "buy") ? "Bought" : "Sold";
			tableEntry.price = tx.price;
			tableEntry.qty = tx.amount;
			tableEntry.holding = qMap[tx.symbol].length();
			_table.push(tableEntry);
			_cashRemaining = cash;
		}
		else throw "Illegal Symbol in Transactions Log";
	}
	
	return {
		table: _table,
		cashRemaining: _cashRemaining
	};
}

module.exports = parse;