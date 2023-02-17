export default async function hello(seconds: number) {
    const delay: number = seconds * 1000
    console.log('start' + delay + 'ms') 
    await new Promise(resolve => setTimeout(resolve, delay));
    console.log('end ' + delay + 'ms')
    return { message: 'Hello.ts with Typescript after ' + delay + 'ms' };
}