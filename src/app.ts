import Leaf from './bsp-map/leaf';
import {Random} from './random';

const MAX_LEAF_SIZE: number = 20;
const random = new Random();

let _leafs: Leaf[] = [];

let l: Leaf;

let root: Leaf = new Leaf(0, 0, 30, 10);

_leafs.push(root);

let didSplit: boolean = true;

while (didSplit) {
    didSplit = false;

    _leafs.forEach(leaf => {
        if (leaf.LeftChild === null && leaf.RightChild === null) {
            if (leaf.Width > MAX_LEAF_SIZE || leaf.Height > MAX_LEAF_SIZE || random.nextNumber() > 0.25) {
                if (leaf.split()) {
                    _leafs.push(leaf.LeftChild);
                    _leafs.push(leaf.RightChild);
                    didSplit = true;
                }
            }
        }
    });
}

root.createRooms();

console.log(_leafs);