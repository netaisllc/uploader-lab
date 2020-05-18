const _ = require('lodash');
const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const fileUpload = require('express-fileupload');
const morgan = require('morgan');

const app = express();

// enable file upload
app.use(
	fileUpload({
		createParentPath: true,
		debug: true,
		limits: { fileSize: 50 * 1024 * 1024 },
		tempFileDir: './tmp',
		useTempFiles: true,
	})
);

// add other middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));

// boot
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`File receiver is listening on port ${port}.`));

app.post('/upload', async (req, res) => {
	let count = 0;
	let data = [];

	const _fileHandler = (v) => {
		let video = v;
		//move video to uploads directory
		video.mv('./uploads/' + video.name);
		//push file details
		data.push({
			name: video.name,
			mimetype: video.mimetype,
			size: video.size,
		});
		count = count + 1;
	};

	try {
		// File or fileset is required
		if (!req.files) {
			res.status(400).send('A file or fileset to upload was expected.');
		}

		if (Array.isArray(req.files.videos)) {
			// Multiple file upload
			_.forEach(_.keysIn(req.files.videos), (key) => {
				_fileHandler(req.files.videos[key]);
			});
		} else {
			// Single file upload
			_fileHandler(req.files.videos);
		}

		// Respond
		res.send({
			count: count,
			data: data,
			message: 'Upload operation completed',
			status: true,
		});
	} catch (err) {
		console.log(err);
		res.status(500).send(err);
	}
});
