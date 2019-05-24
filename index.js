


const state = {
    pending:'Pending',
    resolved:"Resolved",
    rejected:"Rejected"
}

class CustomPromise{
    constructor(executer){
        const members = {
            [state.resolved]:{
                state:state.resolved,
                then(onResolved){
                    return CustomPromise.resolve(onResolved(this.value))
                }
            },
            [state.rejected]:{
                state:state.rejected,
                then(){
                    return this;
                }
            },
            [state.pending]:{
                state:state.pending
            }
        }

        const changeState = state => Object.assign(this, members[state])
        const getCallback = state => value => {
            this.value = value;
            return changeState(state)
        }
        const resolve = getCallback(state.resolved)
        const reject = getCallback(state.rejected)
        this.state = state.pending
        changeState(state.pending);
        try{
            executer(resolve, reject)
        }
        catch(err){
            reject(err)
        }
    }

    static resolve(value){
        return new CustomPromise(resolve => resolve(value))
    }
    static reject(value){
        return new CustomPromise(_, reject => reject(value))
    }

    static try(callback){
        return new CustomPromise(resolve => resolve(callback()))
    }
    then(onResolved){
        return onResolved(this.value)
    }
}

const a = new CustomPromise((resolve, reject) => {
    try{
        resolve(500)
    }
    catch(err){
        reject(err)
    }
})


a.then(data => console.log(data + 10000))

const states = {
    pending:'Pending',
    resolved:"Resolved",
    rejected:"Rejected"
}


class NewPromise{
    constructor(executer){
        this.state = states.pending;
        const resolve = (value) => {
           if(this.state === states.pending){
            this.state = states.resolved
            this.value = value;
            return this;
           }
        }

        const reject = (value) => {
            if(this.state === states.pending){
                this.state = states.rejected
                this.value = value;
                return this;
            }
        }
        try{
             executer(resolve, reject)
        }
        catch(err){
            reject(err)
        }
    }
    then(onResolved){
        if(this.state === states.rejected)return
        const newValue = onResolved(this.value)
        if(newValue){
            this.value = newValue
        }
        return this; 
    }
    catch(onRejected){
        onRejected(this.value)
    }
}

const b = new NewPromise((resolve,reject) => {
    try{
         resolve(700)
    }
    catch(err){
         reject(err)
    }
})

b
.then(a => a + 20)
.then(b => {
    console.log(b)
    return b + 40
})
.then(s => console.log(s))



class PromiseSample{
    constructor(executer){
        this.state = states.pending;
        this.promiseChain = []
        try{
            executer(this.onResolve.bind(this), this.onReject.bind(this))
        }
        catch(err){
            this.onReject(err)
        }
    }
    then(onResolved){
        if(typeof onResolved === 'function'){
            this.promiseChain.push(onResolved)
        }
        return this;
    }
    catch(onRejected){
        if(typeof onResolved === 'function' && this.state === states.rejected){
            onRejected(this.value)
        }
    }
    onResolve(value){
        let storedValue = value;
        try{
            this.promiseChain.forEach(nextFunction => {
                storedValue = nextFunction(storedValue)
            })
            this.state = states.resolved
        }
        catch(err){
            this.promiseChain = [];
            this.onReject(err)
        }
    }
    onReject(err){
        this.state = states.rejected
        this.value = err;
    }
}


const aws = new PromiseSample((resolve, reject) => {
    try{
        setTimeout(() => {
            resolve(500)
        },3000)
    }  
    catch(err){
        reject(err)
    }
})

aws
.then(data => data + 20)
.then(data => data +70)
.then(data => console.log(data))
.catch(err => console.log(err))
