export default function getList() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Тестовые данные
            const response = [
                { id: 1, name: 'John Doe', age: 25, country: 'USA', email: 'john.doe@example.com' },
                { id: 2, name: 'Jane Smith', age: 30, country: 'Canada', email: 'jane.smith@example.com' },
                { id: 3, name: 'Mike Johnson', age: 28, country: 'UK', email: 'mike.johnson@example.co.uk' },
                { id: 4, name: 'Emily White', age: 22, country: 'Australia', email: 'emily.white@example.au' },
                { id: 5, name: 'Chris Brown', age: 35, country: 'Germany', email: 'chris.brown@example.de' }
            ];
    
            resolve(response);
        }, 250);
    });
}