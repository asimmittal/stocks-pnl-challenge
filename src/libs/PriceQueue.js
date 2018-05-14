/**
 * PriceQueue.js
 * creates a queue for a given symbol that contains a series of blocks. Each block
 * represents a price / dollar value for that symbol
*/

class PriceQueue{
	constructor(symbol = null){
		if(!symbol){ 
			throw ("Cannot instantiate a PriceQueue without a symbol");
		}
		
		this.q = [];
		this.symbol = symbol;
	}
	
	/**
	* insert(p)
	* insert a dollar amount into the queue
	*/
	insert(price){
		if(price >= 0){
			this.q.push(price);
		}
		else throw ("Cannot insert negative values into PriceQueue with symbol " + this.symbol);
	}
	
	insertN(price, n){
		if(price >= 0 && n > 0){
			for(var i = 0; i < n; i++) this.insert(price);
		}
	}
	
	/**
	* remove()
	* remove a dollar value from the queue
	*/
	remove(){
		if(this.q.length > 0){
			return this.q.shift();
		}
		else return null;
	}
	
	/**
	* removeN()
	* try to remove N blocks from the queue
	*/
	removeN(n){
	
		if(typeof(n) != typeof(0) || n < 0) throw ("Illegal value for parameter")
		
		let list = [];
		for(let i = 0; i < n; i++){
			let block = this.remove();
			if(!block) break; else list.push(block);
		}
		
		return list;
	}
	
	/**
	* peek()
	* get the value in the top of the queue without removing it
	*/
	peek(){
		if(this.q.length > 0){
			return this.q[0];
		}
		else return null;
	}
	
	/**
	* toString()
	* get the string rep for this queue
	*/
	toString(){
		return this.symbol + "->" + this.q.toString();
	}
	
	/**
	* getTotalValue()
	* get the total value of all the blocks in the queue
	*/
	getTotalValue(){
		let sum = 0;
		for(let i = 0; i < this.q.length; i++) sum += this.q[i];
		return sum;
	}
	
	/**
	* length()
	* get the number of blocks in the queue
	*/
	length(){
		return this.q.length;
	}
	
}

module.exports = PriceQueue;