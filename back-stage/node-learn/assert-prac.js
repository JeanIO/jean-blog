import assert from 'assert';
// try {
//     assert.strictEqual([1,2,[1,2,"3"]], [1,2,[1,2,3]])
// } catch (err) {
//     console.error('❌ 断言失败:', err);
// }
// 创建共享原型
const sharedPrototype = { 
  greeting: 'Hello',
  sayHello: function() {
    return `${this.greeting}, ${this.name}!`;
  }
};

// 创建两个引用相同原型但内容不同的对象
const obj1 = Object.create(sharedPrototype);
obj1.name = 'Alice';
obj1.age = 30;

const obj2 = Object.create(sharedPrototype);
obj2.name = 'Bob';
obj2.age = 25;

const error = new assert.AssertionError({
    message: 'lalalal',
    actual: '+00000000',
    expected: false,
    operator: 'deepStrictEqual'
});
try {
    // assert.deepEqual(/a/gi, new Date()); 
    assert.deepStrictEqual('+00000000', false, error);
    // 验证它们共享相同的原型
    assert.strictEqual(Object.getPrototypeOf(obj1), sharedPrototype);
    assert.strictEqual(Object.getPrototypeOf(obj2), sharedPrototype);
    // assert.strictEqual(Object.getPrototypeOf(obj1), Object.getPrototypeOf(obj2));
    console.log('✅ 两个对象共享相同的原型');

    // 验证它们有不同的自身内容
    assert.notStrictEqual(obj1, obj2);
    assert.notStrictEqual(obj1.name, obj2.name);
    assert.notStrictEqual(obj1.age, obj2.age);
    console.log('✅ 两个对象有不同的自身属性');

    // 验证它们可以调用原型上的方法
    assert.strictEqual(obj1.sayHello(), 'Hello, Alice!');
    assert.strictEqual(obj2.sayHello(), 'Hello, Bob!');
    console.log('✅ 两个对象共享原型方法');
} catch (err) {
    console.error('❌ 对象比较断言失败:', err.actual);
}