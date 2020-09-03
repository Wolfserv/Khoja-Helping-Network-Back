class Tools {

    constructor() {}

    addValueToArray(array, value, delim1, delim2) { // [1, 2] 3 => for delims = '{}' => '{ 1, 2, 3 }'
        var new_arr = delim1 + ' ';
        for (let i = 0; array[i]; i++) {
            new_arr += array[i].toString();
            new_arr += ', '
        }
        new_arr += value.toString() + ' ' + delim2;
        return new_arr;
    }

    convertArray(array, delim1, delim2) { //[1, 2] => for delims = '{}' => '{ 1, 2 }'
        var new_arr = delim1 + ' ';
        new_arr += array[0].toString();
        for (let i = 1; array[i]; i++) {
            new_arr += ', ';
            new_arr += array[i].toString();
        }
        new_arr += ' ' + delim2;
        return new_arr;
    }
};

module.exports = Tools;