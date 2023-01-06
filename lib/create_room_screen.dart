import 'package:flutter/material.dart';
import 'package:scribble_clone/paint_screen.dart';
import 'package:scribble_clone/widgets/custom_text_widget.dart';

class CreateRoomScreen extends StatefulWidget {
  const CreateRoomScreen({super.key});

  @override
  State<CreateRoomScreen> createState() => _CreateRoomScreenState();
}

class _CreateRoomScreenState extends State<CreateRoomScreen> {
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _roomnameController = TextEditingController();
  late String? _maxRoundsValue;
  late String? _roomSizeValue;

  void createRoom() {
    if (_nameController.text.isNotEmpty &&
        _roomnameController.text.isNotEmpty &&
        _maxRoundsValue != null &&
        _roomSizeValue != null) {
      Map<String, String> data = {
        'nickname': _nameController.text,
        'roomname': _roomnameController.text,
        'occupancy': _roomSizeValue!,
        'maxRounds': _maxRoundsValue!
      };
      Navigator.of(context).push(MaterialPageRoute(
          builder: (context) => PaintScreen(data: data, screenFrom: 'create')));
    } else {
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          const Text("Create Room",
              style: TextStyle(color: Colors.black, fontSize: 30)),
          SizedBox(height: MediaQuery.of(context).size.height * 0.08),
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 20),
            child: CustomTextWidget(
              hintText: "Enter your Name",
              controller: _nameController,
            ),
          ),
          const SizedBox(
            height: 20,
          ),
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 20),
            child: CustomTextWidget(
              hintText: "Enter room name",
              controller: _roomnameController,
            ),
          ),
          const SizedBox(
            height: 20,
          ),
          DropdownButton<String>(
            focusColor: const Color(0xffF5F6FA),
            hint: const Text(
              "Select Max Rounds",
              style: TextStyle(
                  color: Colors.black,
                  fontSize: 14,
                  fontWeight: FontWeight.w500),
            ),
            onChanged: (String? value) {
              setState(() {
                _maxRoundsValue = value;
              });
            },
            items: <String>['2', '5', '10', '15']
                .map<DropdownMenuItem<String>>(
                    (String value) => DropdownMenuItem(
                          value: value,
                          child: Text(
                            value,
                            style: const TextStyle(color: Colors.black),
                          ),
                        ))
                .toList(),
          ),
          const SizedBox(
            height: 20,
          ),
          DropdownButton<String>(
            focusColor: const Color(0xffF5F6FA),
            hint: const Text(
              "Select Room Size",
              style: TextStyle(
                  color: Colors.black,
                  fontSize: 14,
                  fontWeight: FontWeight.w500),
            ),
            onChanged: (String? value) {
              setState(() {
                _roomSizeValue = value;
              });
            },
            items: <String>['2', '3', '4', '5', '6', '7', '8']
                .map<DropdownMenuItem<String>>(
                    (String value) => DropdownMenuItem(
                          value: value,
                          child: Text(
                            value,
                            style: const TextStyle(color: Colors.black),
                          ),
                        ))
                .toList(),
          ),
          const SizedBox(
            height: 40,
          ),
          ElevatedButton(
            onPressed: createRoom,
            style: ButtonStyle(
                backgroundColor: MaterialStateProperty.all(
                  Colors.blue,
                ),
                textStyle: MaterialStateProperty.all(
                    const TextStyle(color: Colors.white)),
                minimumSize: MaterialStateProperty.all(
                    Size(MediaQuery.of(context).size.width / 2.5, 50))),
            child: const Text(
              "Create",
              style: TextStyle(color: Colors.white, fontSize: 16),
            ),
          )
        ],
      ),
    );
  }
}
