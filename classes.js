class Vec3 {
    constructor(x=0,y=0,z=0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    add(other) {
        return new Vec3(this.x + other.x, this.y + other.y, this.z + other.z);
    }

    static add(v1, v2) {
        return new Vec3(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
    }

    normalized() {
        return new Vec3(this.x/this.len, this.y/this.len, this.z/this.len);
    }

    scale(n=1) {
        return new Vec3(this.x*n, this.y*n, this.z*n);
    }

    get len() {
        return Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z);
    }
}