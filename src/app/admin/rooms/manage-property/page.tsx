
"use client";
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
  import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload, MoreVertical, Trash2, Star, GripVertical, Plus, Pencil, ArrowUpDown, ArrowLeftRight } from 'lucide-react';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';

const existingPhotos = [
    { id: '1', url: 'https://picsum.photos/seed/prop-img-1/400/300', caption: 'Lobby Area', isCover: true },
    { id: '2', url: 'https://picsum.photos/seed/prop-img-2/400/300', caption: 'Outdoor Pool', isCover: false },
    { id: '3', url: 'https://picsum.photos/seed/prop-img-3/400/300', caption: 'King Suite', isCover: false },
    { id: '4', url: 'https://picsum.photos/seed/prop-img-4/400/300', caption: 'Restaurant', isCover: false },
]

type RoomPlan = {
  id: string;
  name: string;
  type?: string;
  price?: number;
  facilities: string[];
};

type FloorPlan = {
  id: string;
  name: string;
  rooms: RoomPlan[];
};

function FloorPlanEditor() {
  const storageKey = 'vh.floorPlan.manageProperty';
  const demoPlan: FloorPlan[] = [
    {
      id: 'F1',
      name: 'Floor 1',
      rooms: [
        { id: '101', name: 'Room 101', type: 'Double', price: 120, facilities: ['Wi‑Fi', 'TV'] },
        { id: '102', name: 'Room 102', type: 'Single', price: 90, facilities: ['Wi‑Fi'] },
        { id: '103', name: 'Room 103', type: 'Suite', price: 220, facilities: ['Wi‑Fi', 'TV', 'Mini‑bar'] },
      ],
    },
    {
      id: 'F2',
      name: 'Floor 2',
      rooms: [
        { id: '201', name: 'Room 201', type: 'Double', price: 130, facilities: ['Wi‑Fi', 'TV'] },
        { id: '202', name: 'Room 202', type: 'Single', price: 85, facilities: ['Wi‑Fi'] },
      ],
    },
  ];

  const [floors, setFloors] = React.useState<FloorPlan[]>(demoPlan);
  const [roomDialogOpen, setRoomDialogOpen] = React.useState(false);
  const [floorDialogOpen, setFloorDialogOpen] = React.useState(false);
  const [editingRoom, setEditingRoom] = React.useState<RoomPlan | null>(null);
  const [editingFloor, setEditingFloor] = React.useState<FloorPlan | null>(null);
  const [targetFloorId, setTargetFloorId] = React.useState<string | null>(null);
  const FACILITIES = React.useMemo(() => [
    'Wi‑Fi',
    'TV',
    'Mini‑bar',
    'Air Conditioning',
    'Heating',
    'Balcony',
    'Sea View',
    'City View',
    'Kitchenette',
    'Room Service',
    'Safe',
    'Coffee Maker',
    'Hair Dryer',
    'Desk',
  ], []);

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as FloorPlan[];
        if (Array.isArray(parsed)) setFloors(parsed);
      }
    } catch {}
  }, []);

  const saveToStorage = () => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(floors));
    } catch {}
  };

  const resetDemo = () => {
    setFloors(demoPlan);
    try {
      window.localStorage.removeItem(storageKey);
    } catch {}
  };

  const startEditRoom = (room: RoomPlan, floorId: string) => {
    setEditingRoom({ ...room });
    setTargetFloorId(floorId);
    setRoomDialogOpen(true);
  };

  const startCreateRoom = (floorId: string) => {
    setEditingRoom({ id: '', name: '', type: '', price: undefined, facilities: [] });
    setTargetFloorId(floorId);
    setRoomDialogOpen(true);
  };

  const submitRoom = () => {
    if (!editingRoom || !targetFloorId) return;
    setFloors(prev => {
      const next = prev.map(f => ({ ...f, rooms: [...f.rooms] }));
      const floor = next.find(f => f.id === targetFloorId);
      if (!floor) return prev;
      const idx = floor.rooms.findIndex(r => r.id === editingRoom.id);
      const facilities = editingRoom.facilities.map(f => f.trim()).filter(Boolean);
      const payload = { ...editingRoom, facilities };
      if (editingRoom.id && idx >= 0) {
        floor.rooms[idx] = payload;
      } else {
        const newId = editingRoom.id || `${floor.id}${Math.floor(Math.random() * 900 + 100)}`;
        floor.rooms.push({ ...payload, id: newId });
      }
      return next;
    });
    setRoomDialogOpen(false);
    saveToStorage();
  };

  const deleteRoom = (floorId: string, roomId: string) => {
    setFloors(prev => prev.map(f => ({ ...f, rooms: f.rooms.filter(r => r.id !== roomId) })));
    saveToStorage();
  };

  const startEditFloor = (floor: FloorPlan) => {
    setEditingFloor({ ...floor, rooms: [...floor.rooms] });
    setFloorDialogOpen(true);
  };

  const startCreateFloor = () => {
    setEditingFloor({ id: '', name: '', rooms: [] });
    setFloorDialogOpen(true);
  };

  const submitFloor = () => {
    if (!editingFloor) return;
    setFloors(prev => {
      const next = prev.map(f => ({ ...f, rooms: [...f.rooms] }));
      if (editingFloor.id) {
        const idx = next.findIndex(f => f.id === editingFloor.id);
        if (idx >= 0) next[idx].name = editingFloor.name;
      } else {
        const newId = editingFloor.id || `F${prev.length + 1}`;
        next.push({ id: newId, name: editingFloor.name || `Floor ${prev.length + 1}`, rooms: [] });
      }
      return next;
    });
    setFloorDialogOpen(false);
    saveToStorage();
  };

  const deleteFloor = (floorId: string) => {
    setFloors(prev => prev.filter(f => f.id !== floorId));
    saveToStorage();
  };

  const onDragStart = (e: React.DragEvent<HTMLDivElement>, roomId: string, fromFloorId: string) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ roomId, fromFloorId }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDropRoomToFloor = (e: React.DragEvent<HTMLDivElement>, toFloorId: string) => {
    const payload = e.dataTransfer.getData('application/json');
    if (!payload) return;
    try {
      const { roomId, fromFloorId } = JSON.parse(payload) as { roomId: string; fromFloorId: string };
      if (!roomId || !fromFloorId || fromFloorId === toFloorId) return;
      setFloors(prev => {
        const next = prev.map(f => ({ ...f, rooms: [...f.rooms] }));
        const from = next.find(f => f.id === fromFloorId);
        const to = next.find(f => f.id === toFloorId);
        if (!from || !to) return prev;
        const idx = from.rooms.findIndex(r => r.id === roomId);
        if (idx < 0) return prev;
        const [moved] = from.rooms.splice(idx, 1);
        to.rooms.push(moved);
        return next;
      });
      saveToStorage();
    } catch {}
  };

  const swapRooms = (floorId: string, aId: string, bId: string) => {
    setFloors(prev => {
      const next = prev.map(f => ({ ...f, rooms: [...f.rooms] }));
      const floor = next.find(f => f.id === floorId);
      if (!floor) return prev;
      const ai = floor.rooms.findIndex(r => r.id === aId);
      const bi = floor.rooms.findIndex(r => r.id === bId);
      if (ai < 0 || bi < 0) return prev;
      const tmp = floor.rooms[ai];
      floor.rooms[ai] = floor.rooms[bi];
      floor.rooms[bi] = tmp;
      return next;
    });
    saveToStorage();
  };

  const moveRoomWithinFloor = (floorId: string, roomId: string, dir: -1 | 1) => {
    setFloors(prev => {
      const next = prev.map(f => ({ ...f, rooms: [...f.rooms] }));
      const floor = next.find(f => f.id === floorId);
      if (!floor) return prev;
      const idx = floor.rooms.findIndex(r => r.id === roomId);
      if (idx < 0) return prev;
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= floor.rooms.length) return prev;
      const [m] = floor.rooms.splice(idx, 1);
      floor.rooms.splice(newIdx, 0, m);
      return next;
    });
    saveToStorage();
  };

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle>Floors & Rooms Layout</CardTitle>
          <CardDescription>Visualize distribution, drag rooms across floors, and edit details.</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={resetDemo}>Reset to Demo</Button>
          <Button onClick={saveToStorage}>Save Layout</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center gap-2">
          <Button size="sm" onClick={startCreateFloor}>
            <Plus className="mr-2 h-4 w-4" /> Add Floor
          </Button>
        </div>
        <ScrollArea className="h-[480px] w-full">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {floors.map(floor => (
              <div
                key={floor.id}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => onDropRoomToFloor(e, floor.id)}
                className="rounded-lg border p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{floor.id}</Badge>
                    <h3 className="text-sm font-semibold">{floor.name}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="secondary" onClick={() => startEditFloor(floor)}>
                      <Pencil className="mr-2 h-3 w-3" /> Edit Floor
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteFloor(floor.id)}>
                      <Trash2 className="mr-2 h-3 w-3" /> Delete
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  {floor.rooms.map((room, idx) => (
                    <div
                      key={room.id}
                      draggable
                      onDragStart={(e) => onDragStart(e, room.id, floor.id)}
                      className="group w-[260px] cursor-grab rounded-md border bg-card p-3 shadow-sm"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{room.name}</span>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => startEditRoom(room, floor.id)}>
                              <Pencil className="mr-2 h-3 w-3" /> Edit Room
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => moveRoomWithinFloor(floor.id, room.id, -1)}>
                              <ArrowUpDown className="mr-2 h-3 w-3" /> Move Up
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => moveRoomWithinFloor(floor.id, room.id, 1)}>
                              <ArrowUpDown className="mr-2 h-3 w-3 rotate-180" /> Move Down
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              const other = floor.rooms[(idx + 1) % floor.rooms.length];
                              if (other) swapRooms(floor.id, room.id, other.id);
                            }}>
                              <ArrowLeftRight className="mr-2 h-3 w-3" /> Swap With Next
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => deleteRoom(floor.id, room.id)} className="text-destructive">
                              <Trash2 className="mr-2 h-3 w-3" /> Delete Room
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div>Type: <span className="text-foreground">{room.type || '—'}</span></div>
                        <div>Price: <span className="text-foreground">{room.price ? `$${room.price}` : '—'}</span></div>
                        <div className="flex flex-wrap gap-1">
                          {room.facilities.length > 0 ? room.facilities.map(f => (
                            <Badge key={f} variant="secondary" className="text-[10px]">{f}</Badge>
                          )) : <span>Facilities: —</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => startCreateRoom(floor.id)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Room
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Room Editor Dialog */}
        <Dialog open={roomDialogOpen} onOpenChange={setRoomDialogOpen}>
          <DialogContent className="sm:max-w-[520px]">
            <DialogHeader>
              <DialogTitle>{editingRoom?.id ? 'Edit Room' : 'Create Room'}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="room-name">Room Name</Label>
                <Input id="room-name" value={editingRoom?.name || ''} onChange={(e) => setEditingRoom(r => r ? { ...r, name: e.target.value } : r)} />
              </div>
              <div>
                <Label htmlFor="room-type">Type</Label>
                <Input id="room-type" value={editingRoom?.type || ''} onChange={(e) => setEditingRoom(r => r ? { ...r, type: e.target.value } : r)} />
              </div>
              <div>
                <Label htmlFor="room-price">Price</Label>
                <Input id="room-price" type="number" value={editingRoom?.price ?? ''} onChange={(e) => setEditingRoom(r => r ? { ...r, price: e.target.value ? Number(e.target.value) : undefined } : r)} />
              </div>
              <div>
                <Label>Facilities</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {FACILITIES.map((f) => {
                    const checked = !!editingRoom?.facilities?.includes(f)
                    return (
                      <div key={f} className="flex items-center justify-between rounded-md border p-2">
                        <span className="text-sm">{f}</span>
                        <Switch
                          checked={checked}
                          onCheckedChange={(on) => setEditingRoom((r) => {
                            if (!r) return r
                            const next = new Set(r.facilities || [])
                            if (on) next.add(f)
                            else next.delete(f)
                            return { ...r, facilities: Array.from(next) }
                          })}
                          aria-label={`Toggle ${f}`}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setRoomDialogOpen(false)}>Cancel</Button>
              <Button onClick={submitRoom}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Floor Editor Dialog */}
        <Dialog open={floorDialogOpen} onOpenChange={setFloorDialogOpen}>
          <DialogContent className="sm:max-w-[420px]">
            <DialogHeader>
              <DialogTitle>{editingFloor?.id ? 'Edit Floor' : 'Create Floor'}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="floor-name">Floor Name</Label>
                <Input id="floor-name" value={editingFloor?.name || ''} onChange={(e) => setEditingFloor(f => f ? { ...f, name: e.target.value } : f)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setFloorDialogOpen(false)}>Cancel</Button>
              <Button onClick={submitFloor}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

export default function ManagePropertyPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Property Information</CardTitle>
        <CardDescription>
          Update your property's details, policies, and contact information.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FloorPlanEditor />
        <form className="space-y-8">
          {/* Property Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium border-b pb-2">
              Property Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="propertyName">Property Name</Label>
                <Input
                  id="propertyName"
                  defaultValue="VoyageHub Downtown"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="propertyType">Property Type</Label>
                <Select defaultValue="hotel">
                  <SelectTrigger id="propertyType">
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hotel">Hotel</SelectItem>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="guesthouse">Guesthouse</SelectItem>
                    <SelectItem value="resort">Resort</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="A short description of the property, including key selling points."
                rows={4}
              />
            </div>
            <div className="space-y-2">
                <Label htmlFor="languages">Languages Spoken</Label>
                <Input id="languages" placeholder="e.g., English, Spanish, French" />
            </div>
          </div>

          {/* Contact Information Section */}
           <div className="space-y-4">
            <h3 className="text-lg font-medium border-b pb-2">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <Label htmlFor="email">Contact Email</Label>
                    <Input id="email" type="email" placeholder="e.g., contact@voyagehub.com" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phone">Contact Phone</Label>
                    <Input id="phone" type="tel" placeholder="e.g., +1 234 567 890" />
                </div>
            </div>
             <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea id="address" placeholder="123 Main Street, New York, NY 10001" />
            </div>
          </div>
          
            {/* Photos & Media Section */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium border-b pb-2">
                    Photos & Media
                </h3>
                <div className="space-y-2">
                    <Label>Upload New Photos</Label>
                    <div className="flex items-center justify-center w-full">
                        <Label
                            htmlFor="dropzone-file"
                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted"
                        >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                                <p className="mb-2 text-sm text-muted-foreground">
                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-muted-foreground">PNG, JPG, GIF (MAX. 2MB)</p>
                            </div>
                            <Input id="dropzone-file" type="file" className="hidden" multiple />
                        </Label>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Photo Gallery</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {existingPhotos.map(photo => (
                            <Card key={photo.id} className="relative group overflow-hidden">
                                <Image src={photo.url} alt={photo.caption} width={400} height={300} className="object-cover aspect-video" />
                                {photo.isCover && (
                                    <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1">
                                        <Star className="w-3 h-3" /> Cover
                                    </div>
                                )}
                                <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/50 text-white text-xs truncate">
                                    {photo.caption}
                                </div>
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="secondary" size="icon" className="h-7 w-7">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>
                                                <Star className="mr-2 h-4 w-4" /> Set as cover
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive">
                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>

            {/* Rates & Pricing Section */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium border-b pb-2">
                    Rates & Pricing
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="baseRate">Base Rate (per night)</Label>
                        <Input id="baseRate" type="number" placeholder="e.g., 150" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="currency">Currency</Label>
                        <Select defaultValue="usd">
                            <SelectTrigger id="currency">
                                <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="usd">USD</SelectItem>
                                <SelectItem value="eur">EUR</SelectItem>
                                <SelectItem value="gbp">GBP</SelectItem>
                                <SelectItem value="jpy">JPY</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="taxes">Taxes & Fees (%)</Label>
                        <Input id="taxes" type="number" placeholder="e.g., 8.5" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="minStay">Min Stay (nights)</Label>
                        <Input id="minStay" type="number" placeholder="e.g., 1" defaultValue={1} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="maxStay">Max Stay (nights)</Label>
                        <Input id="maxStay" type="number" placeholder="e.g., 30" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="seasonalPricing">Seasonal Pricing Rules</Label>
                    <Textarea id="seasonalPricing" placeholder="e.g., 20% surcharge during December." rows={2} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="discounts">Discounts & Promotions</Label>
                    <Textarea id="discounts" placeholder="e.g., 15% off for stays longer than 7 nights." rows={2} />
                </div>
            </div>

          {/* Policies Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium border-b pb-2">
              Policies & Rules
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="checkIn">Check-in Time</Label>
                <Input id="checkIn" type="time" defaultValue="15:00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="checkOut">Check-out Time</Label>
                <Input id="checkOut" type="time" defaultValue="11:00" />
              </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="houseRules">House Rules</Label>
                <Textarea id="houseRules" placeholder="e.g., No smoking, no pets, quiet hours after 10 PM." rows={3} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="accessibility">Accessibility Information</Label>
                <Textarea id="accessibility" placeholder="e.g., Wheelchair accessible, elevator available." rows={3} />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
