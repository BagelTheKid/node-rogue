import Point from './point';

export default class Rectangle {
    public x: number;
    public y: number;
    public w: number;
    public h: number;

    constructor(X: number, Y: number, W: number, H: number) {
        this.x = X;
        this.y = Y;
        this.w = W;
        this.h = H;
    }

    bottom(): number {
        return this.y + this.h;
    }

    height(): number {
        return this.h;
    }

    width(): number {
        return this.w;
    }

    left(): number {
        return this.x;
    }

    right(): number {
        return this.x + this.w;
    }

    bottomRight(): Point {
        return new Point(this.right(), this.bottom());
    }

    size(): Point {
        return new Point(this.w, this.h);
    }

    top(): number {
        return this.y;
    }

    topLeft(): Point {
        return new Point(this.x, this.y);
    }
}