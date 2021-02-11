const Modal = {
    toggle(){
        document.querySelector(".modal-overlay").classList.toggle("active")
    }
}
const Storage = {
    get(){
        // JSON.parse transforma a string guardada no localStorage para seu tipo original
        return JSON.parse(localStorage.getItem("Transactions")) || [];
    },
    set(transaction){
        // localStorage usa dois parametros para guardar algo
        // o primeiro argumento é a chave para acessar o item
        // o segundo é o valor que será salvo
        
        
        // o localStorage recebe apenas strings
        // JSON.stringfy transforma qualquer valor em string
        
        localStorage.setItem("Transactions", JSON.stringify(transaction))
    
    },
    getSelectedMode(){
        return JSON.parse(localStorage.getItem("selectedMode")) || false;
    },
    setSelectedMode(mode){
        localStorage.setItem("selectedMode", JSON.stringify(mode));
    }
}
const Formats = {
    formatAmount(value){
        
        value = Number(value) * 100;

        return Math.round(value);
    },
    formatDate(date){
        const splitDate = date.split("-");

        return `${splitDate[2]}/${splitDate[1]}/${splitDate[0]}`
    },
    formatCurrency(value){
        const signal = Number(value) < 0 ? "-" : "";

        // retira todos os os valores que não sejam numericos
        // \D busca apenas valores numericos
        // g faz com q seja uma busca global ao inves de buscar apenas a primeira ocorrencia
        value = String(value).replace(/\D/g, "");

        value = Number(value) / 100;

        // transforma o valor para um formato local
        value = value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

        return signal + value
    }
}
const Transactions = {
    
    all: Storage.get(),

    add(transaction){
        Transactions.all.push(transaction);
        App.reload()

    },
    remove(index){
        Transactions.all.splice(index, 1);
        App.reload();
    }
}
const Balance = {
    incomes(){
        let income = 0;

        Transactions.all.forEach(transaction => {
            if(transaction.amount > 0) income += transaction.amount;
        })

        return income;
    }, 
    expenses(){
        let expense = 0;

        Transactions.all.forEach(transaction => {
            if(transaction.amount < 0) expense += transaction.amount;
        })

        return expense;
    },
    total(){
        return Balance.incomes() + Balance.expenses();
    },
    updateBalance(){
        document.getElementById("showIncome").innerHTML = Formats.formatCurrency(Balance.incomes());
        document.getElementById("showExpense").innerHTML = Formats.formatCurrency(Balance.expenses());
        document.getElementById("showTotal").innerHTML = Formats.formatCurrency(Balance.total());
        
    }
}
const Table = {
    
    containerTransection: document.querySelector("#data-table tbody"),
    
    addTransaction(transaction, index){
        const tr = document.createElement("tr");
        tr.innerHTML = Table.transactionData(transaction, index);
        tr.dataset.index = index;

        Table.containerTransection.appendChild(tr)
    },
    transactionData(transaction, index){

        const amount = Formats.formatCurrency(transaction.amount);
        
        const amountClass = transaction.amount > 0 ? "entrada":"saida";

        const html = `
        <tr>
            <td class="description">${transaction.description}</td>
            <td class=${amountClass}>${amount}</td>
            <td class="date">${transaction.date}</td>
            <td><img src="./assets/minus.svg" onclick="Transactions.remove(${index})" ></td>
        </tr>
        `
        return html;
    },
    showTable(){
        Transactions.all.forEach((transaction, index) => {
            Table.addTransaction(transaction, index);
        })
    }
}
const Form = {

    description: document.getElementById("description"),
    amount: document.getElementById("amount"),
    date: document.getElementById("date"),

    submit(event){
        event.preventDefault();

        try {
            Form.validateFields();
            const transaction = Form.formatValues();
            Transactions.add(transaction);
            Form.clearFields();
            Modal.toggle()
        } catch (error) {
            alert("Por favor preencha todos os campos");
        }
    },
    getValues(){
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },
    validateFields(){
        
        const { description, amount, date } = Form.getValues();

        if(description.trim() === "" ||
        amount.trim() === "" ||
        date.trim() === ""){

            throw new Error("por favor, preencha todos os campos!!!")
        
        }
    },
    formatValues(){
        
        let { description, amount, date } = Form.getValues();

        amount = Formats.formatAmount(amount);
        date = Formats.formatDate(date);

        return {
            description,
            amount,
            date
        }

    },
    clearFields(){
        Form.description.value = "";
        Form.amount.value = "";
        Form.date.value = "";
    }
}
const App = {
    init(){
        Balance.updateBalance();
        Table.showTable();
        Storage.set(Transactions.all);
        ToggleMode.verifySelectedMode();
    },
    reload(){
        Table.containerTransection.innerHTML = "";
        App.init()
    }
}
const ToggleMode = {

    clicked: Storage.getSelectedMode(),

    toggle(){

        ToggleMode.saveOption();

        document.querySelector(".input-area button").classList.toggle("dark");

        document.querySelector("body").classList.toggle("dark");

    },
    saveOption(){
        ToggleMode.clicked = !ToggleMode.clicked;
        Storage.setSelectedMode(ToggleMode.clicked);
    },
    verifySelectedMode(){

        if(ToggleMode.clicked){

            document.querySelector(".input-area button").classList.add("dark");
            document.querySelector("body").classList.add("dark");
        
        }
    }
}
App.init()
