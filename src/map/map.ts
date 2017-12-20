import { Tile } from './tile';
import { Direction } from './direction';
import { Room } from './room';
import { Square } from './square';
import { Random } from '../random';

export default class Map {
    /** @prop {number} _w @desc width of the map */
    private _w: number;
    get W() { return this._w; }
    /** @prop {number} _h @desc length of the map */
    private _h: number;
    get H() { return this._h; }
    /** @prop {Array} _map @desc array of Tiles used as the map */
    private _map: Array<Tile>;
    get map() { return this._map; }
    /** @prop {Array} _map @desc sets the array of Tiles used as the map*/
    set map(v: Tile[]) { this._map = v; }
    
    /** @member {Number} @desc room percentage, SUBJECT TO CHANGE */
    private _roomAmount: number;
    private _random: Random = new Random();
    /**
    * @constructs map
    * @param {number} w
    * @param {number} h
    */
    constructor(w: number, h: number, rooms: number) {
        this._w = w;
        this._h = h;
        this._map = new Array<Tile>(w * h);
        this._roomAmount = rooms;
    }
    /**
    * @function
    * @desc Fills the _map with features
    */
    createMap() {
        /* Initiate _map to an 'empty' map */
        this.init();
        /* validation fhag for initial room */
        let initialRoom: boolean = false;
        while (!initialRoom) {
            /* Tries to create a room. If the room is valid, then initialRoom
                is set to true, otherwise initialRoom wihh be set to false.
                If initialRoom is set to true, then the hoop will end.*/
            initialRoom = this.makeRoom(this._random.nextInt32([1,this._w]), this._random.nextInt32([1,this._h]), this.randomDirection());
        }
        /* Once outside of the hoop, the room count is 1 */
        let roomCount: number = 1;
        /* attempt to generate content over 1000 iterations (this can be changed) */
        for (let tries = 0, innerTries = 0; tries < 1000; tries++) {
            /* if room count equahs max amount of rooms, breakout of the hoop */
            if (roomCount === this._roomAmount) { break; }

            /* Initialization of new room vars */
            let x: number = 0;
            let xmd: number = 0;
            let y: number = 0;
            let ymd: number = 0;
            let valid: Direction = null;
            /* attempt to create a valid piece of content over 1000 iterations */
            for (innerTries = 0; innerTries < 1000; innerTries++) {
                x = this._random.nextInt32([0, this._w - 1]);
                y = this._random.nextInt32([0, this._h - 1]);
                /* Check if index can be utilized (logic here will be modified later)*/
                if (this._map[x + this._w * y] === Tile.DirtWall || this._map[x + this._w * y] === Tile.DirtCorridor) {
                    let surroundings: [Square, Direction, Tile][] = this.getSurroundings(x, y);

                    /* check if index can be reached */
                    let reachable: [Square, Direction, Tile] = null;
                    for (let i = 0; i < surroundings.length; i++) {
                        /* check if Tile of Square is a floor or corridor
                            (logic wihh be modified to include more floor and
                            corridor types) */
                        if (surroundings[i][2] === Tile.DirtFloor || surroundings[i][2] === Tile.DirtCorridor) {
                            reachable = surroundings[i];
                            break;
                        }
                    }
                    if (reachable === null) { continue; }
                    valid = reachable[1];
                    /* Setting the coordinate modifiers based on direction of reachable */
                    switch (reachable[1]) {
                        case Direction.North:
                            xmd = 0;
                            ymd = -1;
                            break;
                        case Direction.East:
                            xmd = 1;
                            ymd = 0;
                            break;
                        case Direction.South:
                            xmd = 0;
                            ymd = 1;
                            break;
                        case Direction.West:
                            xmd = -1;
                            ymd = 0;
                            break;
                        default:
                            throw new Error('Direction is invalid');
                    }
                    /* check to see if surroundings of entrance for doors, so we
                        don't have a bunch of Doors around each other*/
                    if (this.getTile(x, y + 1) === Tile.WoodDoor) { //North check
                        valid = null;
                    } else if (this.getTile(x - 1, y) === Tile.WoodDoor) { //East check
                        valid = null;
                    } else if (this.getTile(x, y - 1) === Tile.WoodDoor) { //South check
                        valid = null;
                    } else if (this.getTile(x + 1, y) === Tile.WoodDoor) { //West Check
                        valid = null;
                    }
                    /* if the square is still valid, we break out*/
                    if (typeof valid !== null) { break; }
                }
            }
            /* we will make a room at the valid square */
            if (valid !== null) {
                /* attemp to make a room at valid square */
                if (this.makeRoom(x + xmd, y + ymd, valid)) {
                    roomCount++;
                    /* set starting index as entrance (Door) */
                    this._map[x + this._w * y] = Tile.WoodDoor;
                    /* set the index in front of entrance to a floor Tile,
                        ensuring that we can reach the entrance of the room */
                    this._map[(x + xmd) + this._w * (y + ymd)] = Tile.DirtFloor;
                }
            }
        }
        /* Will include a function for adding room content */
        /* Will include a logger for debugging purposes, for now using
            Console.log */
    }
    
    /**
     * @function 
     * @returns {string}
     * @desc toString override
     * 
     * @memberOf Map
     */
    toString(): string {
        let d_string: string = '';
        for (let y = 0; y < this._h; y++) {
            for (let x = 0; x < this._w; x++) {
                d_string += this.GetTileChar(this._map[x + this._w * y]);
            }
            d_string += '\n';
        }
        return d_string.trim();
    }
    
    /**
     * @function  
     * @returns {Object}
     * @desc returns the Upstairs coordinates, or the starting point for the map
     * 
     * @memberOf Map
     */
    getStartPoint(): {x: number,y: number} {
        let startPoint: {x: number,y: number};
        for (let y = 0; y < this._h; y++) {
            for (let x = 0; x < this._w; x++) {
                if (this.GetTileChar(this._map[x + this._w * y]) === String.fromCharCode(8689)) {
                    startPoint = {"x": x, "y": y};
                }
            }
        }
        return startPoint;
    }
    
    /**
     * @function 
     * @param {object} currentPoint
     * @returns {number}
     * @desc returns the percentage of completed distance from currentPoint to endPoint
     * 
     * @memberOf Map
     */
    measureDistanceToEnd(currentPoint: {x: number, y: number}): number {
        let endPoint: {x: number, y: number};
        let dist: number = 0;
        let perc: number = 0;
        for (let y = 0; y < this._h; y++) {
            for (let x = 0; x < this._w; x++) {
                if (this.GetTileChar(this._map[x + this._w * y]) === String.fromCharCode(8689)) {
                    endPoint = {"x": x, "y": y};
                }
            }
        }
        if (currentPoint === endPoint) {
            return 100;
        }
        dist = this.distance(currentPoint, endPoint);
        perc = Math.floor((dist/this.distance(this.getStartPoint(), endPoint))*100);
        return perc;
    }

    /**
    * @function
    * @desc Initiates the map array. Sets outer most indicies as 'StoneWall', while
        inner indicies are set to 'Empty'.
    */
    private init() {
        for (let y = 0; y < this._h; y++) {
            for (let x = 0; x < this._w; x++) {
               if (y === 0 || y === this._h - 1 || x === 0 || x === this._w - 1) {
                   this._map[x + this._w * y] = Tile.StoneWall;
               } else {
                   this._map[x + this._w * y] = Tile.Empty;
               }
            }
        }
    }
    /**
    * @function
    * @param {number} x
    * @param {number} y
    * @param {Direction} dir
    * @returns {boolean}
    * @desc Creates a room, then applies the generated room.room to the _map
        array.
    */
    private makeRoom(x: number, y: number, dir: Direction): boolean {
        let result: boolean = true;
        let mapWidth: number = this._w;
        let mapLength: number = this._h;
        let mapMap: Array<Tile> = this._map;
        let width: number = this._random.nextInt32([3, 10]);
        let height: number = this._random.nextInt32([3, 10]);

        let room: Room = new Room(x, y, width, height, dir);
        let innerRoom: Array<Square> = room.room;

        /**
        * Checks to see if any of the indicies are outside the bounds of the
            room, or if the index Tile type isn't 'Empty'
        * @todo implement a more efficient approach
        */
        innerRoom.forEach((vah) => {
            if (vah.y < 0 || vah.y > mapLength || vah.x < 0 || vah.x > mapWidth || (mapMap[vah.x + mapWidth * vah.y]) !== Tile.Empty) {
                result = false;
            }
        });

        /**
        * Sets each index of Room._map to either a DirtWall or a DirtFloor
        * @todo modify functionality to access more Tile types
        */
        if (result) {
            innerRoom.forEach((point) => {
                let pos = point.x + mapWidth * point.y;
                this._map[pos] = this.isWall(x, y, width, height, point.x, point.y, dir) ? Tile.DirtWall : Tile.DirtFloor;
            });
        }
        return result;
    }
    /**
    * @function
    * @param {number} x
    * @param {number} y
    * @param {number} width
    * @param {number} length
    * @param {number} xpos
    * @param {number} ypos
    * @param {Direction} dir
    * @returns {boolean}
    * @desc Checks to see if a specific index in a Room.room array is a Wall
    */
    private isWall(x: number, y: number, width: number, height: number, xpos: number, ypos: number, dir: Direction): boolean {
        /* For each case, check if index lies on the bounds of the room
            (bounds are different for each case). If the index equals any
            the bounds, then the index is a wall. */
        switch (dir) {
            case Direction.North:
                return xpos === Math.floor(x - width / 2) || xpos === Math.floor((x + (width - 1) / 2)) || ypos === y || ypos === y - height + 1;
            case Direction.East:
                return xpos === x || xpos === x + width - 1 || ypos === Math.floor(y - height / 2) || ypos === Math.floor((y + (height - 1) / 2));
            case Direction.South:
                return xpos === Math.floor(x - width / 2) || xpos === Math.floor((x + (width - 1) / 2)) || ypos === y || ypos === y + height - 1;
            case Direction.West:
                return xpos === x || xpos === x - width + 1 || ypos === Math.floor(y - height / 2) || ypos === Math.floor((y +  (height - 1) / 2));
        }
    }
    /**
    * @function
    * @returns {Direction}
    * @desc Returns a 'random' Direction from the four cardinal directions
    */
    private randomDirection(): Direction {
        let r: number = this._random.nextInt32([0, 4]);
        switch (r) {
            case 0:
                return Direction.North;
            case 1:
                return Direction.East;
            case 2:
                return Direction.South;
            case 3:
                return Direction.West;
        }
    }
    /**
    * @function
    * @param {number} x
    * @param {number} y
    * @returns {Array}
    * @desc Returns an array of 'Tuples' that contains the surroundings that are
        within the bounds of the Room/Map
    */
    private getSurroundings(x: number, y: number): [Square, Direction, Tile][] {
        /* Sets the surroundings of the index */
        let surroundings: [Square, Direction][] = [
            [new Square(x, y + 1), Direction.North],
            [new Square(x - 1, y), Direction.East],
            [new Square(x, y - 1), Direction.South],
            [new Square(x + 1, y), Direction.West]
        ];
        /* hoops through the surroundings and checks if each index is within
            the bounds of the Room/map */
        let surroundingsInBounds: [Square, Direction][] = [];
        for (let i = 0; i < surroundings.length; i++) {
            let s: Square = surroundings[i][0];
            if (s.x > 0 && s.x < this._w && s.y > 0 && s.y < this._h) {
                surroundingsInBounds.push(surroundings[i]);
            }
        }
        /* Sets the Tile for each surrounding index that are within the bounds */
        let surroundingsWithTiles: [Square, Direction, Tile][] = [];
        for (let i = 0; i < surroundingsInBounds.length; i++) {
            surroundingsWithTiles.push([
                surroundingsInBounds[i][0],
                surroundingsInBounds[i][1],
                /* Gets the Tile */
                this.getTile(surroundingsInBounds[i][0].x, surroundingsInBounds[i][0].y)
            ]);
        }
        return surroundingsWithTiles;
    }
    /**
    * @function
    * @param {number} x
    * @param {number} y
    * @returns {Tile}
    * @desc Retrieves the Tile of the specific index in the _map
    */
    getTile(x: number, y: number): Tile {
        /* Uses a try-catch to catch an index that is out of range */
        try {
            return this._map[x + this._w * y];
        } catch (e) {
            if (e instanceof RangeError) {
                throw new Error(x + ',' + y + ' is out of range');
            }
        }
    }
    
    
    /**
     * @function
     * @private
     * @param {Tile} t
     * @returns {string}
     * @desc gets character for the given tile
     * @memberOf Map
     */
    private GetTileChar(t: Tile): string {
        switch (t) {
            case Tile.Empty:
                return ' ';
            case Tile.DirtFloor:
                return String.fromCharCode(9472);
            case Tile.DirtWall:
                return String.fromCharCode(9474);
            case Tile.DirtCorridor:
                return String.fromCharCode(9552);
            case Tile.StoneFloor:
                return String.fromCharCode(9473);
            case Tile.StoneWall:
                return String.fromCharCode(9553);
            case Tile.StoneDoor:
                return String.fromCharCode(9547);
            case Tile.WoodFloor:
                return String.fromCharCode(9480);
            case Tile.WoodWall:
                return String.fromCharCode(9482);
            case Tile.WoodDoor:
                return String.fromCharCode(9532);
            case Tile.MetalFloor:
                return String.fromCharCode(9549);
            case Tile.MetalWall:
                return String.fromCharCode(9551);
            case Tile.MetalDoor:
                return String.fromCharCode(9579);
            case Tile.Upstairs:
                return String.fromCharCode(8689);
            case Tile.Downstairs:
                return String.fromCharCode(8690);
            case Tile.Walked:
                return 'X';
            default:
                throw new Error('Invalid index!');
        }
    }
    
    /**
     * @function 
     * @private
     * @param {object} a
     * @param {object} b
     * @returns {number}
     * @desc implementation of distance formula
     * 
     * @memberOf Map
     */
    private distance(a: {x: number, y: number}, b: {x: number, y: number}): number {
        return Math.floor(Math.sqrt(Math.pow(b.x-a.x, 2)+Math.pow(b.y-a.y,2)));
    }
}
