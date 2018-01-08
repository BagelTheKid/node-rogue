import {Random} from '../random';
import Point from './point';
import Rectangle from './rectangle';

export default class Leaf {
    private MIN_LEAF_SIZE: number = 6;
    private random: Random;

    private y: number;
    get Y(): number {
        return this.y;
    }

    private x: number;
    get X(): number {
        return this.x;
    }

    private width: number;
    get Width(): number {
        return this.width;
    }

    private height: number;
    get Height(): number {
        return this.height;
    }

    private leftChild: Leaf;
    get LeftChild(): Leaf {
        return this.leftChild;
    }

    private rightChild: Leaf;
    get RightChild(): Leaf {
        return this.rightChild;
    }

    public room: Rectangle;
    public halls: Rectangle[];

    constructor(X: number, Y: number, W: number, H: number) {
        this.x = X;
        this.y = Y;
        this.width = W;
        this.height = H;
        this.random = new Random();
        this.leftChild = null;
        this.rightChild = null;
    }

    getRoom(): Rectangle {
        // iterate all the way down to find a room, if there is one
        if (this.room !== undefined) {
            return this.room;
        } else {
            let leftRoom: Rectangle;
            let rightRoom: Rectangle;

            if (this.leftChild !== null) {
                leftRoom = this.leftChild.getRoom();
            }
            if (this.rightChild !== null) {
                rightRoom = this.rightChild.getRoom();
            }

            if (leftRoom === null && rightRoom === null) {
                return null;
            } else if (rightRoom === null) {
                return leftRoom;
            } else if (leftRoom === null) {
                return rightRoom;
            } else if (this.random.nextNumber() > 0.5) {
                return leftRoom;
            } else {
                return rightRoom;
            }
        }
    }

    split(): boolean {
        // check to see if already split
        if (this.leftChild !== null || this.rightChild !== null) {
            return false; // leaf is already split, return out
        }

        // determine split direction
        // if width is > 25% larger than height, split vert
        // if height is > 25% larger than width, split horz
        // otherwise, split randomly
        let splitH: boolean = this.random.nextNumber() > 0.5;
        if (this.width > this.height && this.width / this.height >= 1.25) {
            splitH = false;
        } else if (this.height > this.width && this.height / this.width >= 1.25) {
            splitH = true;
        }

        // determine max
        let max: number = (splitH ? this.height : this.width) - this.MIN_LEAF_SIZE;

        if (max <= this.MIN_LEAF_SIZE) {
            return false; // area is too small to split
        }

        // determine split location
        let split: number = this.random.nextInt32([this.MIN_LEAF_SIZE, max]);

        // create child based off of split direction
        if (splitH) {
            this.leftChild = new Leaf(this.x, this.y, this.width, split);
            this.rightChild = new Leaf(this.x, this.y + split, this.width, this.height - split);
        } else {
            this.leftChild = new Leaf(this.x, this.y, split, this.height);
            this.rightChild = new Leaf(this.x + split, this.y, this.width - split, this.height);
        }

        return true;
    }

    createRooms(): void {
        // create rooms
        if (this.leftChild !== null || this.rightChild !== null) {
            // create rooms in the leftChild if it isn't null
            if (this.leftChild !== null) {
                this.leftChild.createRooms();
            }
            // create rooms in the right
            if (this.rightChild !== null) {
                this.rightChild.createRooms();
            }

            // create a hall if there are left and right children in this leaf
            if (this.leftChild !== null && this.rightChild !== null) {
                this.createHall(this.leftChild.getRoom(), this.rightChild.getRoom());
            }
        } else {
            // this leaf is small enough for a room
            let roomSize: Point;
            let roomPos: Point;
            // rooms can be between 3x3 tiles to the size of the leaf - 2
            roomSize = new Point(this.random.nextInt32([3, this.width - 2]), this.random.nextInt32([3, this.height - 2]));
            // place room appropriately inside leaf
            roomPos = new Point(this.random.nextInt32([1, this.width - roomSize.x - 1]), this.random.nextInt32([1, this.height - roomSize.y - 1]));
            this.room = new Rectangle(this.x + roomPos.x, this.y + roomPos.y, roomSize.x, roomSize.y);
        }
    }

    createHall(leftR: Rectangle, rightR: Rectangle): void {
        this.halls = new Array<Rectangle>();

        let point1: Point = new Point(this.random.nextInt32([leftR.left() + 1, leftR.right() - 2]), this.random.nextInt32([leftR.top() + 1, leftR.bottom() - 2]));
        let point2: Point = new Point(this.random.nextInt32([rightR.left() + 1, rightR.right() -2]), this.random.nextInt32([rightR.top() + 1, rightR.bottom() - 2]));

        let w: number = point2.x - point1.x;
        let h: number = point2.y - point1.y;

        if (w < 0) {
            if (h < 0) {
                if (this.random.nextNumber() < 0.5) {
                    this.halls.push(new Rectangle(point2.x, point1.y, Math.abs(w), 1));
                    this.halls.push(new Rectangle(point2.x, point2.y, 1, Math.abs(h)));
                } else {
                    this.halls.push(new Rectangle(point2.x, point2.y, Math.abs(w), 1));
                    this.halls.push(new Rectangle(point1.x, point2.y, 1, Math.abs(h)));
                }
            } else if (h > 0) {
                if (this.random.nextNumber() < 0.5) {
                    this.halls.push(new Rectangle(point2.x, point1.y, Math.abs(w), 1));
                    this.halls.push(new Rectangle(point2.x, point1.y, 1, Math.abs(h)));
                } else {
                    this.halls.push(new Rectangle(point2.x, point2.y, Math.abs(w), 1));
                    this.halls.push(new Rectangle(point1.x, point1.y, 1, Math.abs(h)));
                }
            } else { // if h === 0
                this.halls.push(new Rectangle(point2.x, point2.y, Math.abs(w), 1));
            }
        } else if (w > 0) {
            if (h < 0) {
                if (this.random.nextNumber() < 0.5) {
                    this.halls.push(new Rectangle(point1.x, point2.y, Math.abs(w), 1));
                    this.halls.push(new Rectangle(point1.x, point2.y, 1, Math.abs(h)));
                } else {
                    this.halls.push(new Rectangle(point1.x, point1.y, Math.abs(w), 1));
                    this.halls.push(new Rectangle(point2.x, point2.y, 1, Math.abs(h)));
                }
            } else if (h > 0) {
                if (this.random.nextNumber() < 0.5) {
                    this.halls.push(new Rectangle(point1.x, point1.y, Math.abs(w), 1));
                    this.halls.push(new Rectangle(point2.x, point1.y, 1, Math.abs(h)));
                } else {
                    this.halls.push(new Rectangle(point1.x, point2.y, Math.abs(w), 1));
                    this.halls.push(new Rectangle(point1.x, point1.y, 1, Math.abs(h)));
                }
            } else { // if h === 0
                this.halls.push(new Rectangle(point1.x, point1.y, Math.abs(w), 1));
            }
        } else { // if w === 0
            if (h < 0) {
                this.halls.push(new Rectangle(point2.x, point2.y, 1, Math.abs(h)));
            } else if (h > 0) {
                this.halls.push(new Rectangle(point1.x, point1.y, 1, Math.abs(h)));
            }
        }
    }
}