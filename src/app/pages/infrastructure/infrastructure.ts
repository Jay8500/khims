import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Bed {
  id: string;
  bedNo: string;
  type: 'General' | 'ICU' | 'Private';
  status: 'Available' | 'Occupied' | 'Maintenance';
  pricePerDay: number;
}

interface Room {
  roomNo: string;
  floor: string;
  beds: Bed[];
}

@Component({
  selector: 'app-infrastructure',
  standalone: true, // Added standalone true for modern Angular
  imports: [CommonModule, FormsModule],
  templateUrl: './infrastructure.html',
  styleUrl: './infrastructure.css',
})
export class Infrastructure {
  // --- UI STATE SIGNALS ---
  showAddBedSidebar = signal(false); // Renamed to match the sidebar HTML
  
  hospitalMap = signal<Room[]>([
    {
      floor: '1st Floor',
      roomNo: '101',
      beds: [
        { id: 'B1', bedNo: '101-A', type: 'General', status: 'Available', pricePerDay: 1500 },
        { id: 'B2', bedNo: '101-B', type: 'General', status: 'Occupied', pricePerDay: 1500 },
      ],
    },
    {
      floor: '2nd Floor',
      roomNo: 'ICU-A',
      beds: [{ id: 'I1', bedNo: 'ICU-01', type: 'ICU', status: 'Available', pricePerDay: 8000 }],
    },
  ]);

  // --- METHODS ---

  addBed(formValue: any) {
    const newBed: Bed = {
      id: 'B' + Date.now(),
      bedNo: formValue.bedNo,
      type: formValue.type,
      status: 'Available',
      pricePerDay: Number(formValue.price)
    };

    this.hospitalMap.update(rooms => {
      // Check if room exists, if not, we create a new room object
      const roomExists = rooms.find(r => r.roomNo === formValue.roomNo && r.floor === formValue.floor);
      
      if (roomExists) {
        return rooms.map(room => 
          (room.roomNo === formValue.roomNo && room.floor === formValue.floor) 
          ? { ...room, beds: [...room.beds, newBed] } 
          : room
        );
      } else {
        // Create a new room if it doesn't exist
        return [...rooms, { floor: formValue.floor, roomNo: formValue.roomNo, beds: [newBed] }];
      }
    });

    this.showAddBedSidebar.set(false);
  }

  removeBed(roomId: string, bedId: string) {
    this.hospitalMap.update((rooms) =>
      rooms.map((room) => {
        if (room.roomNo === roomId) {
          return { ...room, beds: room.beds.filter((b) => b.id !== bedId) };
        }
        return room;
      })
    );
  }

  removeRoom(roomNo: string) {
    if (confirm(`Are you sure you want to remove Room ${roomNo}?`)) {
      this.hospitalMap.update((rooms) => rooms.filter((r) => r.roomNo !== roomNo));
    }
  }

  changeFloor(roomNo: string, newFloor: string) {
    this.hospitalMap.update((rooms) =>
      rooms.map((r) => (r.roomNo === roomNo ? { ...r, floor: newFloor } : r))
    );
  }
}