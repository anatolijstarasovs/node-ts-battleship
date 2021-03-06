import { IPlayer } from "../interface/iplayer";
import * as config from "../config";
import { Ship } from "../object/ship";
import { IShip } from "interface/iship";

export class Player implements IPlayer {
    public id: string;

    public shots: [number];
    public grid: [number];
    public ships: [Ship];

    constructor(id: string) {
        this.id = id;
        let max = config.grid.rows * config.grid.rows;

        this.shots = [max];
        this.grid = [max];
        this.ships = [new Ship(config.ships.map[1])];

        for (let i = 0; i < max; i++) {
            this.shots[i] = 0;
            this.grid[i] = -1;
        }

        if (!this.random()) {
            return;
        }
    }

    shoot(index: number) {
        if (this.grid[index] >= 0) {
            this.ships[this.grid[index]].hits++;
            this.shots[index] = 2;
            return true;
        } else {
            this.shots[index] = 1;
            return false;
        }
    }

    getSunk() {
        let sunk = [];
        for (let i = 0; i < this.ships.length; i++) {
            if (this.ships[i].sunk()) {
                sunk.push(this.ships[i]);
            }
        }
        return sunk;
    }

    remaining() {
        let count = 0;
        for (let i = 0; i < this.ships.length; i++) {
            if (!this.ships[i].sunk()) {
                count++;
            }
        }
        return count;
    }

    random() {
        this.ships.splice(0, this.ships.length);
        for (let index = 0; index < config.ships.map.length; index++) {
            let ship = new Ship(config.ships.map[index]);
            if (!this.place(ship, index)) {
                return false;
            }
            this.ships.push(ship);
        }
        return true;
    }

    place(ship: IShip, index: number) {
        let gridIndex, xMax, yMax;
        for (let i = 0; i < config.ships.max; i++) {
            ship.vertical = Math.random() > 0.5;
            xMax = !ship.vertical ? config.grid.rows - ship.size + 1 : config.grid.rows;
            yMax = !ship.vertical ? config.grid.rows : config.grid.rows - ship.size + 1;
            ship.coordinate.x = Math.floor(Math.random() * xMax);
            ship.coordinate.y = Math.floor(Math.random() * yMax);
            if (!this.overlap(ship) && !this.adjacent(ship)) {
                gridIndex = ship.coordinate.y * config.grid.rows + ship.coordinate.x;
                for (let j = 0; j < ship.size; j++) {
                    this.grid[gridIndex] = index;
                    gridIndex += !ship.vertical ? 1 : config.grid.rows;
                }
                return true;
            }
        }
        return false;
    }

    overlap(ship: IShip) {
        let index = ship.coordinate.y * config.grid.rows + ship.coordinate.x;
        for (let i = 0; i < ship.size; i++) {
            if (this.grid[index] >= 0) {
                return true;
            }
            index += !ship.vertical ? 1 : config.grid.rows;
        }
        return false;
    }

    adjacent(ship: IShip) {
        let x1 = ship.coordinate.x - 1,
            y1 = ship.coordinate.y - 1,
            x2 = !ship.vertical ? ship.coordinate.x + ship.size : ship.coordinate.x + 1,
            y2 = !ship.vertical ? ship.coordinate.y + 1 : ship.coordinate.y + ship.size;
        for (let i = x1; i <= x2; i++) {
            if (i < 0 || i > config.grid.rows - 1) continue;
            for (let j = y1; j <= y2; j++) {
                if (j < 0 || j > config.grid.rows - 1) continue;
                if (this.grid[j * config.grid.rows + i] >= 0) {
                    return true;
                }
            }
        }
        return false;
    }
}
