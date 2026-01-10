


const obj1 = {
    name: "obj1",
    handle: function(...args) {
        console.log("name" + this.name)
        console.log("args" + args)
    }
}

const obj2 = {
    name: "obj2"
}


obj1.handle.bind(obj2,[1,2,3])()